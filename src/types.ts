import { CronJob } from "cron";
import { Collection } from "mongodb";

export interface Message {
  chatId: number;
  text: string;
}

export type TextMessage = {
  message_id: number;
  chat: {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
  };
  text: string;
  date: number;
};

export type MongoMessage = Partial<Document> & {
  chatId: number;
  text: string;
  message_id: number;
  from: object;
};

export interface IUser {
  id: number;
  isBot: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  cron?: CronData;
  coordinates?: Coordinates[];
}

export type keyboardButtons = Array<
  Array<
    | { text: string; request_location: boolean }
    | { text: string; request_location?: undefined }
  >
>;

export type KeyboardOptions = {
  reply_markup: {
    keyboard: keyboardButtons;
    one_time_keyboard: boolean;
  };
};

export interface IDbClient {
    //getCollection<T>(arg0: string): unknown;
    connect(): Promise<void>;
    //close(): Promise<void>;
    findUserByChatId(chatId: number): Promise<boolean>;
    insertUser(user: IUser): Promise<void>;
    updateCoordinatesInCollection(chatId: number, coordinates: Coordinates);
    getFieldFromMongoCollection(chatId: number, field: string);
    updateCronInCollection(chatId: number, cron: CronData);
    removeCoordinateFromCollection(chatId: number, index: number);
    removeAllCoordinatesFromCollection(chatId: number);
    getCronData(collectionName: string): Promise<NewCron[]>
  }

export type Coordinates = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export type CronData = {
  cronString: string;
  date: string;
  id: string;
}

export enum DATABASE_TYPE {
 MONGO = 'mongo',
 REDIS = 'redis'
}

export interface CronJobObject {
  [id: string]: CronJob;
}

export type NewCron = {
  cronData : CronData;
  id: number;
}