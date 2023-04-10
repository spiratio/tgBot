"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegramBot_1 = require("./telegramBot");
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("./types");
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL;
const MONGO_URL = process.env.MONGO_URL;
const bot = new telegramBot_1.TelegramBot(types_1.DATABASE_TYPE.MONGO, MONGO_URL);
bot.start();
