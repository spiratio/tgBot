import { Telegraf, Context, Markup } from 'telegraf';
import { MongoDbClient } from './mongoDbClient';
import { RedisDbClient } from './redisClient';
import dotenv from 'dotenv';
import {
  CronData,
  DATABASE_TYPE,
  IDbClient,
  IUser,
  keyboardButtons,
  KeyboardOptions,
} from './types';
import Weather from './weatherData';
import { Geocoder } from './geoHelpers';
import { CronJob } from 'cron';
import { convertIntervalToCron } from './helpers';
import { v4 as uuidv4 } from 'uuid';
import { CronManager } from './cronManager';

dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('Error: no bot token specified in environment variables');
  process.exit(1);
}

type DatabaseType = DATABASE_TYPE;

export class TelegramBot {
  private readonly bot: Telegraf<Context>;
  private readonly dBClient: IDbClient;
  private readonly databaseType: DatabaseType;
  private getWeather: Weather;
  private geocoder: Geocoder;
  private cron: CronJob;
  private currentDate: Date;
  private cronManager = new CronManager();

  constructor(databaseType: DatabaseType, DB_URL: string) {
    this.databaseType = databaseType;
    this.bot = new Telegraf(BOT_TOKEN);
    this.getWeather = new Weather();
    this.geocoder = new Geocoder();
    this.cron;
    this.currentDate = new Date();
    this.cronManager = new CronManager();
    if (this.databaseType === DATABASE_TYPE.MONGO) {
      this.dBClient = new MongoDbClient(DB_URL);
    } else {
      this.dBClient = new RedisDbClient(DB_URL);
    }

    this.bot.hears('Пришли мне погоду прям сейчас', (ctx) => {
      const keyboardOptions = this.getKeyboard();

      ctx.reply('Please share your location', keyboardOptions);
    });

    this.bot.on('location', async (ctx: Context) => {
      if (ctx.message && 'location' in ctx.message) {
        const { latitude, longitude } = ctx.message.location;
        if (latitude && longitude) {
          ctx.reply(await this.getWeather.getWeather(latitude, longitude));
        } else {
          ctx.reply('Coordinates could not be determined');
        }
      }
    });

    this.bot.hears('Подписка на получение погоды', (ctx) => {
      const keyboard = Markup.inlineKeyboard(
        [
          Markup.button.callback(
            'Добавить новую локацию для получения погоды',
            'add',
          ),
          Markup.button.callback('Просмотреть добавленные места', 'get'),
          Markup.button.callback('Указать интервалы получения погоды', 'time'),
          Markup.button.callback('Удалить место', 'remove'),
          Markup.button.callback('Удалить все места', 'removeAll'),
          Markup.button.callback('Пришли погоду сейчас', 'allWeather'),
        ],
        { columns: 1 },
      );
      ctx.reply('Здесь ты можешь выбрать:', keyboard);
    });

    this.bot.action(
      ['add', 'get', 'remove', 'removeAll', 'allWeather'],
      async (ctx) => {
        const action = ctx.match[0];
        switch (action) {
          case 'add': {
            this.addNewLocationInDB(ctx);
            break;
          }
          case 'get': {
            await this.getAllLocationFromDB(ctx);
            break;
          }
          case 'removeAll': {
            await this.removeAllLocationFromDB(ctx);
            break;
          }
          case 'remove': {
            await this.removeLocationFromDB(ctx);
            break;
          }
          case 'allWeather': {
            await this.getAllWeather(ctx.chat.id);
            break;
          }
        }
      },
    );

    this.bot.action('time', (ctx) => {
      const keyboard = Markup.inlineKeyboard(
        [
          Markup.button.callback('раз в одну минутку', 'minute'),
          Markup.button.callback('раз в один час', 'hour'),
          Markup.button.callback('раз в 8 часов', 'eightHours'),
          Markup.button.callback('раз в 12 часов', 'twelveHours'),
          //Markup.button.callback('другое', 'other'),
        ],
        { columns: 1 },
      );
      ctx.reply('Как часто вы хотите получать погоду?', keyboard);
    });

    this.bot.action(
      ['minute', 'hour', 'eightHours', 'twelveHours'],
      async (ctx) => {
        const action = ctx.match[0];
        switch (action) {
          case 'minute': {
            const cronString = '* * * * *';
            await this.updateTime(ctx, cronString);
            break;
          }
          case 'hour': {
            const cronString = convertIntervalToCron(1);
            await this.updateTime(ctx, cronString);
            break;
          }
          case 'eightHours': {
            const cronString = convertIntervalToCron(8);
            await this.updateTime(ctx, cronString);
            break;
          }
          case 'twelveHours': {
            const cronString = convertIntervalToCron(12);
            await this.updateTime(ctx, cronString);
            break;
          }
        }
      },
    );

    this.bot.action(/.+/, async (ctx) => {
      const chatId = ctx.chat?.id;
      const result = await this.dBClient.getFieldFromMongoCollection(
        chatId,
        'coordinates',
      );
      const index = Number.parseInt(ctx.match[0]);
      if (index >= 0 && index < result.length) {
        const removedAddress = result[index].formattedAddress;
        await this.dBClient.removeCoordinateFromCollection(chatId, index);
        ctx.reply(`Место "${removedAddress}" удалено.`);
      }
    });

    this.configureBot();

  }
  public async configureBot(): Promise<void> {
    this.bot.start(async (ctx) => {
      const keyboardOptions = this.getKeyboard();
      const chatId = ctx.chat?.id;
      if (chatId) {
        const isUser = await this.dBClient.findUserByChatId(chatId);

        if (isUser) {
          ctx.reply(
            `${ctx.message.from.first_name}, добро пожаловать домой 😏! Хочу напомнить, что этот бот умеет отправлять погоду по геолокации и отправлять погоду в заданные промежутки времени. Для того чтобы воспользоваться ботом, нажмите на кнопочки внизу ⬇️`,
            keyboardOptions,
          );
        } else {
          const user = this.createUserInDB(ctx);
          await this.dBClient.insertUser(user);
          ctx.reply(
            'Добро пожаловать в погодаОтправлятельБот 😧😁. Бот умеет отправлять погоду по геолокации и отправлять погоду в заданнх местах, в заданные интервалы. Для того чтобы воспользоваться ботом, нажмите на кнопочки внизу ⬇️',
            keyboardOptions,
          );
        }
      }
    });
  }

  async addNewLocationInDB(ctx: Context) {
    await ctx.reply('Пришлите название местечка');

    this.bot.on('message', async (ctx) => {
      try {
        if (ctx.message && 'text' in ctx.message) {
          const locationName = ctx.message.text;
          const chatId = ctx.chat?.id;
          const coordinates = await this.geocoder.getCoordinates(locationName);
          const coordinatesFromCollection =
            await this.dBClient.getFieldFromMongoCollection(
              chatId,
              'coordinates',
            );

          let coordinatesFound = false;
          if (coordinatesFromCollection !== undefined) {
            for (let i = 0; i < coordinatesFromCollection.length; i++) {
              if (
                coordinatesFromCollection[i].formattedAddress ===
                coordinates.formattedAddress
              ) {
                coordinatesFound = true;
                await ctx.reply(
                  `${coordinates.formattedAddress} уже добавлен!`,
                );
                break;
              }
            }
          }
          if (!coordinatesFound) {
            await this.dBClient.updateCoordinatesInCollection(
              chatId,
              coordinates,
            );
            await ctx.reply(
              `${coordinates.formattedAddress} успешно добавлен!`,
            );
          }
        }
      } catch (error) {
        console.error(error);
        await ctx.reply(
          'Произошла ошибка при добавлении нового местоположения.',
        );
      }
    });
  }

  async getAllLocationFromDB(ctx: Context) {
    try {
      const chatId = ctx.chat?.id;
      const coordinates = await this.dBClient.getFieldFromMongoCollection(
        chatId,
        'coordinates',
      );
      let result: string = '';
      if (coordinates !== undefined) {
        for (let i = 0; i < coordinates.length; i++) {
          result = result + `${coordinates[i].formattedAddress}` + '\n' + '\n';
        }
      } else {
        result = 'Список локаций пуст!';
      }

      ctx.reply(result);
    } catch (error) {
      console.error(error);
      await ctx.reply('Произошла ошибка при отправке всех координат.');
    }
  }

  private createUserInDB(ctx: Context): IUser {
    const { id, is_bot, first_name, last_name, username, language_code } =
      ctx.message.from;
    return {
      id,
      isBot: is_bot,
      firstName: first_name,
      lastName: last_name,
      username,
      languageCode: language_code,
    };
  }
  async start(): Promise<void> {
    await this.dBClient.connect();
    await this.restartCronJob();
    this.bot.launch();
  }

  async removeAllLocationFromDB(ctx: Context) {
    const chatId = ctx.chat?.id;
    await this.dBClient.removeAllCoordinatesFromCollection(chatId);
    ctx.reply('Все удалено');
  }

  async removeLocationFromDB(ctx: Context) {
    const chatId = ctx.chat?.id;
    const result = await this.dBClient.getFieldFromMongoCollection(
      chatId,
      'coordinates',
    );
    const a: any[] = [];
    for (let i = 0; i < result.length; i++) {
      a.push(Markup.button.callback(`${result[i].formattedAddress}`, `${i}`));
    }
    const keyboard = Markup.inlineKeyboard(a, { columns: 1 });
    ctx.reply('Выбери что удалить', keyboard);
  }

  async getAllWeather(chatId: number) {
    //const chatId = ctx.chat?.id;
    const coordinates = await this.dBClient.getFieldFromMongoCollection(
      chatId,
      'coordinates',
    );
    let result: string = '';

    for (let i = 0; i < coordinates.length; i++) {
      const wheatherResult = await this.getWeather.getWeather(
        coordinates[i].latitude,
        coordinates[i].longitude,
      );
      result =
        result +
        `${coordinates[i].formattedAddress}` +
        '\n' +
        wheatherResult +
        '\n' +
        '\n';
    }
    this.sendMessage(chatId, result);
    //ctx.reply(result);
  }

  public async sendMessage(userId: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(userId, message);
    } catch (error) {
      console.error(`Failed to send message to user ${userId}: ${error}`);
    }
  }

  async updateTime(ctx: Context, cronTime: string) {
    const chatId = ctx.chat?.id;
    const jobId = uuidv4();
    try {
      const cron: CronData = await this.dBClient.getFieldFromMongoCollection(
        chatId,
        'cron',
      );
      if (cron !== undefined && cron.id !== undefined) {
        const job = this.cronManager.getCronJob(cron.id);
        if (job) {
          job.stop();
          this.cronManager.removeCronJob(cron.id);
        }
      }

      this.cronManager.addCronJob(jobId, cronTime, async () => {
        await this.getAllWeather(ctx.chat.id);
      });

      const cronData: CronData = {
        cronString: cronTime,
        date: this.currentDate.toLocaleString(),
        id: jobId,
      };

      this.dBClient.updateCronInCollection(chatId, cronData);
    } catch (error) {
      console.error(error);
      await ctx.reply('Произошла ошибка при установлении интервала.');
    }
  }

  public async restartCronJob() {
    const crons = await this.dBClient.getCronData('users');
    crons.forEach((cron) => {
      this.cronManager.scheduleJob(cron.cronData.id, cron.cronData.cronString, async () => {
        await this.getAllWeather(cron.id);
      })
    });
  }

  getKeyboard(): KeyboardOptions {
    return {
      reply_markup: {
        keyboard: this.getMainKeyboard(),
        one_time_keyboard: true,
      },
    };
  }
  getMainKeyboard(): keyboardButtons {
    return [
      [
        { text: 'Пришли мне погоду прям сейчас', request_location: true },
        { text: 'Подписка на получение погоды' },
      ],
    ];
  }
}

export { IUser };
