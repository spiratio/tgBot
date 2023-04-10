import { CronJob } from 'cron';

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

export interface IDbClient {
  connect(): Promise<void>;
  findUserByChatIdInCollection(
    chatId: number,
    collectionName: string,
  ): Promise<boolean>;
  insertUserInCollection(user: IUser, collectionName: string): Promise<void>;
  updateCoordinatesInCollection(
    chatId: number,
    coordinates: Coordinates,
    collectionName: string,
  );
  getFieldFromCollection(chatId: number, field: string, collectionName: string);
  updateCronInCollection(
    chatId: number,
    cron: CronData,
    collectionName: string,
  );
  removeCoordinateFromCollection(
    chatId: number,
    index: number,
    collectionName: string,
  );
  removeAllCoordinatesFromCollection(chatId: number, collectionName: string);
  getCronData(collectionName: string): Promise<NewCron[]>;
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

export type Coordinates = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

export type CronData = {
  cronString: string;
  date: string;
  id: string;
};

export enum DATABASE_TYPE {
  MONGO = 'mongo',
  REDIS = 'redis',
}

export interface CronJobObject {
  [id: string]: CronJob;
}

export type NewCron = {
  cronData: CronData;
  id: number;
};
