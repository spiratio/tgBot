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
exports.Geocoder = void 0;
const node_geocoder_1 = __importDefault(require("node-geocoder"));
class Geocoder {
    constructor() {
        this.geocoder = (0, node_geocoder_1.default)({
            provider: 'openstreetmap',
        });
    }
    getCoordinates(district) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.geocoder.geocode(district);
            if (results.length === 0) {
                throw new Error('Сoordinates not found');
            }
            else {
                console.log(results);
                return {
                    latitude: results[0].latitude,
                    longitude: results[0].longitude,
                    formattedAddress: results[0].formattedAddress,
                };
            }
        });
    }
}
exports.Geocoder = Geocoder;
