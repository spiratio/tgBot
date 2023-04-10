import { TelegramBot } from './telegramBot';
import dotenv from 'dotenv';
import { DATABASE_TYPE } from './types';

dotenv.config();
const REDIS_URL = process.env.REDIS_URL;
const MONGO_URL = process.env.MONGO_URL;

const bot = new TelegramBot(DATABASE_TYPE.MONGO, MONGO_URL);
bot.start();
