import { MongoClient, Db, Collection, UpdateFilter } from 'mongodb';
import { IUser } from './telegramBot';
import { Coordinates, CronData, IDbClient, NewCron } from './types';

export class MongoDbClient implements IDbClient {
  private db: Db;
  private client: MongoClient;

  constructor(MONGO_URL: string) {
    this.client = new MongoClient(MONGO_URL);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
      this.db = this.client.db();
    } catch {
      console.error('Failed to connect to MongoDB');
      process.exit(1);
    }
  }

  public async close(): Promise<void> {
    await this.client.close();
    console.log('Connection to MongoDB closed');
  }

  public async insertUser(user: IUser): Promise<void> {
    const usersCollection = this.db.collection('users');
    await usersCollection.insertOne(user);
    console.log('User added to MongoDB');
  }

  public async findUserByChatId(chatId: number): Promise<boolean> {
    const usersCollection = this.getCollection<IUser>('users');
    const user = await usersCollection.findOne({ id: chatId });
    return user !== null;
  }

  public async updateCoordinatesInCollection(
    chatId: number,
    coordinates: Coordinates,
  ) {
    // мб лучше перегрузка?
    const usersCollection = this.getCollection<IUser>('users');
    const update = { $push: { coordinates: coordinates } };
    const result = await usersCollection.updateOne({ id: chatId }, update, {
      upsert: true,
    });
    console.log(`Updated ${result.modifiedCount} document(s).`);
  }

  public async updateCronInCollection(chatId: number, cron: CronData) {
    const usersCollection = this.getCollection<IUser>('users');

    const update = { $set: { cron } };
    const result = await usersCollection.updateOne({ id: chatId }, update, {
      upsert: true,
    });
    console.log(`Updated ${result.modifiedCount} document(s).`);
  }

  public getCollection<T>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }

  public async getCronData(collectionName: string): Promise<NewCron[]> {
    const usersCollection = this.getCollection<IUser>(collectionName);
    const cursor = usersCollection.find();
    let result: NewCron[] = [];
    await cursor.forEach((user) => {
      if(user.cron !== undefined){
        const cron: NewCron = {
          cronData: user.cron,
          id: user.id
        }
        result.push(cron)
      }
    });
    console.log(result);
    return result;
  }

  public async getFieldFromMongoCollection(chatId: number, field: string) {
    const usersCollection = this.getCollection<IUser>('users');
    const user = await usersCollection.findOne({ id: chatId });
    return user[field];
  }

  public async removeCoordinateFromCollection(chatId: number, index: number) {
    const usersCollection = this.getCollection<IUser>('users');
    const d = await usersCollection.updateOne(
      { chatId },
      {
        $pull: { coordinates: { formattedAddress: { $eq: index.toString() } } },
      },
    );
  }

  public async removeAllCoordinatesFromCollection(chatId: number) {
    const usersCollection = this.getCollection<IUser>('users');
    const result = await usersCollection.updateOne(
      { id: chatId },
      { $unset: { coordinates: '' } },
    );
    console.log(`Removed ${result.modifiedCount} documents`);
  }
}
