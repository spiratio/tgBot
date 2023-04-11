import NodeGeocoder from 'node-geocoder';
import { Coordinates } from './types';
import { Errors } from './constants';


export class Geocoder {
  geocoder: NodeGeocoder.Geocoder;

  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'openstreetmap',
    });
  }

  public async getCoordinates(district: string): Promise<Coordinates> {
  try {
    const results = await this.geocoder.geocode(district);
    if (results.length === 0) {
      throw new Error(Errors.COORDINATES_NOT_FOUND);
    } else {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
        formattedAddress: results[0].formattedAddress,
      };
    }
  } catch (error) {
    console.error(error);
    throw new Error(Errors.FAILED_TO_GET_COORDINATES);
  }
}
}
