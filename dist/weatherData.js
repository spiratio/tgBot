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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const WEATHER_KEY = process.env.WEATHER_KEY;
if (!WEATHER_KEY) {
    console.error('Error: no weather key specified in environment variables');
    process.exit(1);
}
class Weather {
    getWeather(latitude, longitude) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_KEY}&q=${latitude},${longitude}`;
            const response = yield axios_1.default.get(url);
            const weatherData = response.data;
            const temperature = weatherData.current.temp_c;
            const description = weatherData.current.condition.text;
            return `Temperature: ${temperature} °C\nDescription: ${description}`;
        });
    }
}
exports.default = Weather;
