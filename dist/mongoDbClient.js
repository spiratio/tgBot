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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDbClient = void 0;
const mongodb_1 = require("mongodb");
class MongoDbClient {
    constructor(MONGO_URL) {
        this.client = new mongodb_1.MongoClient(MONGO_URL);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                console.log('Connected to MongoDB');
                this.db = this.client.db();
            }
            catch (_a) {
                console.error('Failed to connect to MongoDB');
                process.exit(1);
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
            console.log('Connection to MongoDB closed');
        });
    }
    insertUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.db.collection('users');
            yield usersCollection.insertOne(user);
            console.log('User added to MongoDB');
        });
    }
    findUserByChatId(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.getCollection('users');
            const user = yield usersCollection.findOne({ id: chatId });
            return user !== null;
        });
    }
    updateCoordinatesInCollection(chatId, coordinates) {
        return __awaiter(this, void 0, void 0, function* () {
            // мб лучше перегрузка?
            const usersCollection = this.getCollection('users');
            const update = { $push: { coordinates: coordinates } };
            const result = yield usersCollection.updateOne({ id: chatId }, update, {
                upsert: true,
            });
            console.log(`Updated ${result.modifiedCount} document(s).`);
        });
    }
    updateCronInCollection(chatId, cron) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.getCollection('users');
            const update = { $set: { cron } };
            const result = yield usersCollection.updateOne({ id: chatId }, update, {
                upsert: true,
            });
            console.log(`Updated ${result.modifiedCount} document(s).`);
        });
    }
    getCollection(collectionName) {
        return this.db.collection(collectionName);
    }
    getCronData(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.getCollection(collectionName);
            const cursor = usersCollection.find();
            let result = [];
            yield cursor.forEach((user) => {
                if (user.cron !== undefined) {
                    const cron = {
                        cronData: user.cron,
                        id: user.id
                    };
                    result.push(cron);
                }
            });
            console.log(result);
            return result;
        });
    }
    getFieldFromMongoCollection(chatId, field) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.getCollection('users');
            const user = yield usersCollection.findOne({ id: chatId });
            return user[field];
        });
    }
    removeCoordinateFromCollection(chatId, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.getCollection('users');
            const d = yield usersCollection.updateOne({ chatId }, {
                $pull: { coordinates: { formattedAddress: { $eq: index.toString() } } },
            });
        });
    }
    removeAllCoordinatesFromCollection(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.getCollection('users');
            const result = yield usersCollection.updateOne({ id: chatId }, { $unset: { coordinates: '' } });
            console.log(`Removed ${result.modifiedCount} documents`);
        });
    }
}
exports.MongoDbClient = MongoDbClient;
