import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const WEATHER_KEY = process.env.WEATHER_KEY;

if (!WEATHER_KEY) {
  console.error('Error: no weather key specified in environment variables');
  process.exit(1);
}

class Weather {
  async getWeather(latitude, longitude) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_KEY}&q=${latitude},${longitude}`;
    const response = await axios.get(url);
    const weatherData = response.data;
    const temperature = weatherData.current.temp_c;
    const description = weatherData.current.condition.text;
    return `Temperature: ${temperature} °C\nDescription: ${description}`;
  }
}

export default Weather;
