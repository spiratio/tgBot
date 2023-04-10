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
exports.RedisDbClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisDbClient {
    constructor(REDIS_URL) {
        this.client = new ioredis_1.default(REDIS_URL);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                console.log('Connected to Redis');
            }
            catch (_a) {
                throw new Error('Failed to connect to Redis');
            }
        });
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
    updateCoordinatesInCollection(chatId, coordinates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getFieldFromMongoCollection(chatId, field) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    updateCronInCollection(chatId, cron) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeCoordinateFromCollection(chatId, index) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeAllCoordinatesFromCollection(chatId) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getCronData(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            let res;
            return res;
        });
    }
    findUserByChatId(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.client.get(`user:${chatId}`, (err, reply) => {
                    if (err) {
                        console.error('Redis findUserByChatId error:', err);
                        reject(err);
                    }
                    else {
                        resolve(reply !== null);
                    }
                });
            });
        });
    }
    insertUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                yield this.client.set(`user:${user.id}`, JSON.stringify(user), (err) => {
                    if (err) {
                        console.error('Redis insertUser error:', err);
                        reject(err);
                    }
                    else {
                        console.log('User added to Redis');
                        resolve();
                    }
                });
            }));
        });
    }
}
exports.RedisDbClient = RedisDbClient;
