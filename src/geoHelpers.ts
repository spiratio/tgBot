import NodeGeocoder from 'node-geocoder';
import { Coordinates } from './types';

export class Geocoder {
  geocoder: NodeGeocoder.Geocoder;

  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'openstreetmap',
    });
  }

  public async getCoordinates(district: string): Promise<Coordinates> {
    const results = await this.geocoder.geocode(district);
    if (results.length === 0) {
      throw new Error('Сoordinates not found');
    } else {
      console.log(results);
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
        formattedAddress: results[0].formattedAddress,
      };
    }
  }
}
