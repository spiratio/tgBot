import {
  MongoClient,
  Db,
  Collection,
  Filter,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
} from 'mongodb';
import { IUser } from './telegramBot';
import { Coordinates, CronData, IDbClient, NewCron } from './types';
import { Errors, Messages } from './constants';

export class MongoDbClient implements IDbClient {
  private db: Db;
  private client: MongoClient;

  constructor(mongo_url: string) {
    this.client = new MongoClient(mongo_url);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log(Messages.CONNECTED_TO_MONGODB);
      this.db = this.client.db();
    } catch (error) {
      console.error(Errors.MONGO_CONNECTION_ERROR, error);
      process.exit(1);
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
      console.log(Messages.CONNECTION_CLOSED);
    } catch (err) {
      console.error(Errors.MONGO_CLOSED_ERROR, err);
    }
  }

  public async insertUserInCollection(
    user: IUser,
    collectionName: string,
  ): Promise<void> {
    const usersCollection = this.db.collection(collectionName);
    try {
      await usersCollection.insertOne(user);
      console.log(Messages.USER_ADDED_TO_MONGO);
    } catch (error) {
      console.error(Errors.MONGO_INSERT_ERROR, error);
      throw error;
    }
  }

  public async findUserByChatIdInCollection(
    chatId: number,
    collectionName: string,
  ): Promise<boolean> {
    try {
      const userField = await this.getFieldFromCollection(
        chatId,
        'id',
        collectionName,
      );
      return userField !== null;
    } catch (error) {
      console.error(Errors.MONGO_FIND_ERROR, error);
      throw error;
    }
  }

  public async getFieldFromCollection(
    chatId: number,
    field: string,
    collectionName: string,
  ): Promise<any> {
    try {
      const usersCollection = this.getCollection<IUser>(collectionName);
      const user = await usersCollection.findOne({ id: chatId });
      return user[field];
    } catch (error) {
      console.error(Errors.MONGO_FIND_ERROR, error);
      throw error;
    }
  }

  public async removeCoordinateFromCollection(
    chatId: number,
    index: number,
    collectionName: string,
  ) {
    try {
      const usersCollection = this.getCollection<IUser>(collectionName);
      const d = await usersCollection.updateOne(
        { chatId },
        {
          $pull: {
            coordinates: { formattedAddress: { $eq: index.toString() } },
          },
        },
      );
    } catch (error) {
      console.error(Errors.MONGO_USER_NOT_FOUND_ERROR, error);
      throw error;
    }
  }

  public getCollection<T>(collectionName: string): Collection<T> {
    try {
      return this.db.collection<T>(collectionName);
    } catch (error) {
      console.error(Errors.MONGO_COLLECTION_ERROR, error);
      throw error;
    }
  }

  public async updateCoordinatesInCollection(
    chatId: number,
    coordinates: Coordinates,
    collectionName: string,
  ): Promise<void> {
    try {
      const usersCollection = this.getCollection<IUser>(collectionName);
      const update = { $push: { coordinates: coordinates } };
      const result = await this.updateDocument(
        usersCollection,
        { id: chatId },
        update,
        { upsert: true },
      );
      console.log(`Updated ${result.modifiedCount} document(s).`);
    } catch (error) {
      console.error(Errors.MONGO_UPDATE_ERROR, error);
      throw error;
    }
  }

  public async updateCronInCollection(
    chatId: number,
    cron: CronData,
    collectionName: string,
  ): Promise<void> {
    try {
      const usersCollection = this.getCollection<IUser>(collectionName);
      const update = { $set: { cron } };
      const result = await this.updateDocument(
        usersCollection,
        { id: chatId },
        update,
        { upsert: true },
      );
      console.log(`Updated ${result.modifiedCount} document(s).`);
    } catch (error) {
      console.error(Errors.MONGO_UPDATE_ERROR, error);
      throw error;
    }
  }

  private async updateDocument<T>(
    collection: Collection<T>,
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: UpdateOptions,
  ): Promise<UpdateResult> {
    const result = await collection.updateOne(filter, update, options);
    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error(Errors.MONGO_UPDATE_ERROR);
    }
    return result;
  }

  public async getCronData(collectionName: string): Promise<NewCron[]> {
    try {
      const usersCollection = this.getCollection<IUser>(collectionName);
      const cursor = usersCollection.find();
      let result: NewCron[] = [];
      await cursor.forEach((user) => {
        if (user.cron !== undefined) {
          const cron: NewCron = {
            cronData: user.cron,
            id: user.id,
          };
          result.push(cron);
        }
      });
      console.log(result);
      return result;
    } catch (err) {
      console.error(`Error getting cron data: ${err}`);
      throw new Error(Errors.MONGO_FIND_ERROR);
    }
  }

  public async removeAllCoordinatesFromCollection(
    chatId: number,
    collectionName: string,
  ) {
    try {
      const usersCollection = this.getCollection<IUser>(collectionName);
      const result = await usersCollection.updateOne(
        { id: chatId },
        { $unset: { coordinates: '' } },
      );
      if (result.matchedCount === 0) {
        throw new Error(Errors.MONGO_USER_NOT_FOUND_ERROR);
      }
      console.log(`Removed ${result.modifiedCount} documents`);
    } catch (error) {
      console.error(Errors.MONGO_UPDATE_ERROR, error);
      throw error;
    }
  }
}
