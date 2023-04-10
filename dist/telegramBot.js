"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBot = void 0;
const telegraf_1 = require("telegraf");
const mongoDbClient_1 = require("./mongoDbClient");
const redisClient_1 = require("./redisClient");
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("./types");
const weatherData_1 = __importDefault(require("./weatherData"));
const geoHelpers_1 = require("./geoHelpers");
const cron_1 = require("./cron");
const uuid_1 = require("uuid");
const cronManager_1 = require("./cronManager");
dotenv_1.default.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('Error: no bot token specified in environment variables');
    process.exit(1);
}
class TelegramBot {
    constructor(databaseType, DB_URL) {
        this.cronManager = new cronManager_1.CronManager();
        this.databaseType = databaseType;
        this.bot = new telegraf_1.Telegraf(BOT_TOKEN);
        this.getWeather = new weatherData_1.default();
        this.geocoder = new geoHelpers_1.Geocoder();
        this.cron;
        this.currentDate = new Date();
        this.cronManager = new cronManager_1.CronManager();
        if (this.databaseType === types_1.DATABASE_TYPE.MONGO) {
            this.dBClient = new mongoDbClient_1.MongoDbClient(DB_URL);
        }
        else {
            this.dBClient = new redisClient_1.RedisDbClient(DB_URL);
        }
        this.bot.hears('Пришли мне погоду прям сейчас', (ctx) => {
            const keyboardOptions = this.getKeyboard();
            ctx.reply('Please share your location', keyboardOptions);
        });
        this.bot.on('location', (ctx) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.message && 'location' in ctx.message) {
                const { latitude, longitude } = ctx.message.location;
                if (latitude && longitude) {
                    ctx.reply(yield this.getWeather.getWeather(latitude, longitude));
                }
                else {
                    ctx.reply('Coordinates could not be determined');
                }
            }
        }));
        this.bot.hears('Подписка на получение погоды', (ctx) => {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback('Добавить новую локацию для получения погоды', 'add'),
                telegraf_1.Markup.button.callback('Просмотреть добавленные места', 'get'),
                telegraf_1.Markup.button.callback('Указать интервалы получения погоды', 'time'),
                telegraf_1.Markup.button.callback('Удалить место', 'remove'),
                telegraf_1.Markup.button.callback('Удалить все места', 'removeAll'),
                telegraf_1.Markup.button.callback('Пришли погоду сейчас', 'allWeather'),
            ], { columns: 1 });
            ctx.reply('Здесь ты можешь выбрать:', keyboard);
        });
        this.bot.action(['add', 'get', 'remove', 'removeAll', 'allWeather'], (ctx) => __awaiter(this, void 0, void 0, function* () {
            const action = ctx.match[0];
            switch (action) {
                case 'add': {
                    this.addNewLocationInDB(ctx);
                    break;
                }
                case 'get': {
                    yield this.getAllLocationFromDB(ctx);
                    break;
                }
                case 'removeAll': {
                    yield this.removeAllLocationFromDB(ctx);
                    break;
                }
                case 'remove': {
                    yield this.removeLocationFromDB(ctx);
                    break;
                }
                case 'allWeather': {
                    yield this.getAllWeather(ctx.chat.id);
                    break;
                }
            }
        }));
        this.bot.action('time', (ctx) => {
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback('раз в одну минутку', 'minute'),
                telegraf_1.Markup.button.callback('раз в один час', 'hour'),
                telegraf_1.Markup.button.callback('раз в 8 часов', 'eightHours'),
                telegraf_1.Markup.button.callback('раз в 12 часов', 'twelveHours'),
                //Markup.button.callback('другое', 'other'),
            ], { columns: 1 });
            ctx.reply('Как часто вы хотите получать погоду?', keyboard);
        });
        this.bot.action(['minute', 'hour', 'eightHours', 'twelveHours'], (ctx) => __awaiter(this, void 0, void 0, function* () {
            const action = ctx.match[0];
            switch (action) {
                case 'minute': {
                    const cronString = '* * * * *';
                    yield this.updateTime(ctx, cronString);
                    break;
                }
                case 'hour': {
                    const cronString = (0, cron_1.convertIntervalToCron)(1);
                    yield this.updateTime(ctx, cronString);
                    break;
                }
                case 'eightHours': {
                    const cronString = (0, cron_1.convertIntervalToCron)(8);
                    yield this.updateTime(ctx, cronString);
                    break;
                }
                case 'twelveHours': {
                    const cronString = (0, cron_1.convertIntervalToCron)(12);
                    yield this.updateTime(ctx, cronString);
                    break;
                }
            }
        }));
        this.bot.action(/.+/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
            const result = yield this.dBClient.getFieldFromMongoCollection(chatId, 'coordinates');
            const index = Number.parseInt(ctx.match[0]);
            if (index >= 0 && index < result.length) {
                const removedAddress = result[index].formattedAddress;
                yield this.dBClient.removeCoordinateFromCollection(chatId, index);
                ctx.reply(`Место "${removedAddress}" удалено.`);
            }
        }));
        this.configureBot();
    }
    configureBot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.start((ctx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const keyboardOptions = this.getKeyboard();
                const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
                if (chatId) {
                    const isUser = yield this.dBClient.findUserByChatId(chatId);
                    if (isUser) {
                        ctx.reply(`${ctx.message.from.first_name}, добро пожаловать домой 😏! Хочу напомнить, что этот бот умеет отправлять погоду по геолокации и отправлять погоду в заданные промежутки времени. Для того чтобы воспользоваться ботом, нажмите на кнопочки внизу ⬇️`, keyboardOptions);
                    }
                    else {
                        const user = this.createUserInDB(ctx);
                        yield this.dBClient.insertUser(user);
                        ctx.reply('Добро пожаловать в погодаОтправлятельБот 😧😁. Бот умеет отправлять погоду по геолокации и отправлять погоду в заданнх местах, в заданные интервалы. Для того чтобы воспользоваться ботом, нажмите на кнопочки внизу ⬇️', keyboardOptions);
                    }
                }
            }));
        });
    }
    addNewLocationInDB(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ctx.reply('Пришлите название местечка');
            this.bot.on('message', (ctx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    if (ctx.message && 'text' in ctx.message) {
                        const locationName = ctx.message.text;
                        const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
                        const coordinates = yield this.geocoder.getCoordinates(locationName);
                        const coordinatesFromCollection = yield this.dBClient.getFieldFromMongoCollection(chatId, 'coordinates');
                        let coordinatesFound = false;
                        if (coordinatesFromCollection !== undefined) {
                            for (let i = 0; i < coordinatesFromCollection.length; i++) {
                                if (coordinatesFromCollection[i].formattedAddress ===
                                    coordinates.formattedAddress) {
                                    coordinatesFound = true;
                                    yield ctx.reply(`${coordinates.formattedAddress} уже добавлен!`);
                                    break;
                                }
                            }
                        }
                        if (!coordinatesFound) {
                            yield this.dBClient.updateCoordinatesInCollection(chatId, coordinates);
                            yield ctx.reply(`${coordinates.formattedAddress} успешно добавлен!`);
                        }
                    }
                }
                catch (error) {
                    console.error(error);
                    yield ctx.reply('Произошла ошибка при добавлении нового местоположения.');
                }
            }));
        });
    }
    getAllLocationFromDB(ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
                const coordinates = yield this.dBClient.getFieldFromMongoCollection(chatId, 'coordinates');
                let result = '';
                if (coordinates !== undefined) {
                    for (let i = 0; i < coordinates.length; i++) {
                        result = result + `${coordinates[i].formattedAddress}` + '\n' + '\n';
                    }
                }
                else {
                    result = 'Список локаций пуст!';
                }
                ctx.reply(result);
            }
            catch (error) {
                console.error(error);
                yield ctx.reply('Произошла ошибка при отправке всех координат.');
            }
        });
    }
    createUserInDB(ctx) {
        const { id, is_bot, first_name, last_name, username, language_code } = ctx.message.from;
        return {
            id,
            isBot: is_bot,
            firstName: first_name,
            lastName: last_name,
            username,
            languageCode: language_code,
        };
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dBClient.connect();
            yield this.restartCronJob();
            this.bot.launch();
        });
    }
    removeAllLocationFromDB(ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
            yield this.dBClient.removeAllCoordinatesFromCollection(chatId);
            ctx.reply('Все удалено');
        });
    }
    removeLocationFromDB(ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
            const result = yield this.dBClient.getFieldFromMongoCollection(chatId, 'coordinates');
            const a = [];
            for (let i = 0; i < result.length; i++) {
                a.push(telegraf_1.Markup.button.callback(`${result[i].formattedAddress}`, `${i}`));
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard(a, { columns: 1 });
            ctx.reply('Выбери что удалить', keyboard);
        });
    }
    getAllWeather(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            //const chatId = ctx.chat?.id;
            const coordinates = yield this.dBClient.getFieldFromMongoCollection(chatId, 'coordinates');
            let result = '';
            for (let i = 0; i < coordinates.length; i++) {
                const wheatherResult = yield this.getWeather.getWeather(coordinates[i].latitude, coordinates[i].longitude);
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
        });
    }
    sendMessage(userId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.bot.telegram.sendMessage(userId, message);
            }
            catch (error) {
                console.error(`Failed to send message to user ${userId}: ${error}`);
            }
        });
    }
    updateTime(ctx, cronTime) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
            const jobId = (0, uuid_1.v4)();
            try {
                const cron = yield this.dBClient.getFieldFromMongoCollection(chatId, 'cron');
                if (cron !== undefined && cron.id !== undefined) {
                    const job = this.cronManager.getCronJob(cron.id);
                    if (job) {
                        job.stop();
                        this.cronManager.removeCronJob(cron.id);
                    }
                }
                this.cronManager.addCronJob(jobId, cronTime, () => __awaiter(this, void 0, void 0, function* () {
                    yield this.getAllWeather(ctx.chat.id);
                }));
                const cronData = {
                    cronString: cronTime,
                    date: this.currentDate.toLocaleString(),
                    id: jobId,
                };
                this.dBClient.updateCronInCollection(chatId, cronData);
            }
            catch (error) {
                console.error(error);
                yield ctx.reply('Произошла ошибка при установлении интервала.');
            }
        });
    }
    restartCronJob() {
        return __awaiter(this, void 0, void 0, function* () {
            const crons = yield this.dBClient.getCronData('users');
            crons.forEach((cron) => {
                this.cronManager.scheduleJob(cron.cronData.id, cron.cronData.cronString, () => __awaiter(this, void 0, void 0, function* () {
                    yield this.getAllWeather(cron.id);
                }));
            });
        });
    }
    getKeyboard() {
        return {
            reply_markup: {
                keyboard: this.getMainKeyboard(),
                one_time_keyboard: true,
            },
        };
    }
    getMainKeyboard() {
        return [
            [
                { text: 'Пришли мне погоду прям сейчас', request_location: true },
                { text: 'Подписка на получение погоды' },
            ],
        ];
    }
}
exports.TelegramBot = TelegramBot;
