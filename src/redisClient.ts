import Redis, { Redis as RedisClient } from 'ioredis';
import { IUser } from './telegramBot';
import { Coordinates, CronData, IDbClient, NewCron } from './types';

export class RedisDbClient implements IDbClient {
  private client: RedisClient;

  constructor(REDIS_URL: string) {
    this.client = new Redis(REDIS_URL);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to Redis');
    } catch {
      throw new Error('Failed to connect to Redis');
    }
  }

  // async close(): Promise<void> {
  //   try {
  //     await new Promise<void>((resolve, reject) => {
  //       this.client.quit((err) => {
  //         if (err) {
  //           console.error('Redis client close error:', err);
  //           reject(err);
  //         } else {
  //           console.log('Redis client closed');
  //           resolve();
  //         }
  //       });
  //     });
  //   } catch (err) {
  //     throw new Error(`Failed to close Redis client: ${err.message}`);
  //   }
  // }
  public async updateCoordinatesInCollection(chatId: number, coordinates: Coordinates){}
  public async getFieldFromCollection(chatId: number, field: string, collectionName: string){}
  public async updateCronInCollection(chatId: number, cron: CronData){}
  public async removeCoordinateFromCollection(chatId: number, index: number, collectionName: string){}
  public async removeAllCoordinatesFromCollection(chatId: number, collectionName: string) {}
  public async getCronData(collectionName: string): Promise<NewCron[]>{
    let res: NewCron[];
    return res;
  }

  async findUserByChatIdInCollection(chatId: number, collectionName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.client.get(`user:${chatId}`, (err, reply) => {
        if (err) {
          console.error('Redis findUserByChatId error:', err);
          reject(err);
        } else {
          resolve(reply !== null);
        }
      });
    });
  }
  async insertUserInCollection(user: IUser, collectionName: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      await this.client.set(`user:${user.id}`, JSON.stringify(user), (err) => {
        if (err) {
          console.error('Redis insertUser error:', err);
          reject(err);
        } else {
          console.log('User added to Redis');
          resolve();
        }
      });
    });
  }
}
