export type OpenMetroResponse = {
  current_weather: {
    temperature: number,
    windspeed: number,
    winddirection: number,
    weathercode: number,
    time: string
  },
  latitude: number,
  longitude: number,
  generationtime_ms: number,
  utc_offset_seconds: number,
  timezone: string,
  timezone_abbreviation: string,
  elevation: number,
  hourly_units: {
    time: string,
    temperature_2m: string,
    relativehumidity_2m: string,
    dewpoint_2m: string,
    precipitation: string,
    rain: string,
    showers: string,
    snowfall: string,
    snow_depth: string,
    weathercode: string,
    surface_pressure: string
  },
  hourly: {
    time: string[],
    temperature_2m: number[],
    relativehumidity_2m: number[],
    dewpoint_2m: number[],
    precipitation: number[],
    rain: number[],
    showers: number[],
    snowfall: number[],
    snow_depth: number[],
    weathercode: number[],
    surface_pressure: number[]
  },
  daily_units: {
    time: string,
    weathercode: string,
    temperature_2m_max: string,
    temperature_2m_min: string,
    sunrise: string,
    sunset: string,
    precipitation_sum: string,
    rain_sum: string,
    showers_sum: string,
    snowfall_sum: string,
    precipitation_hours: string,
    windspeed_10m_max: string,
    windgusts_10m_max: string,
    winddirection_10m_dominant: string,
    shortwave_radiation_sum: string,
    precipitation_probability_max: string
  },
  daily: {
    time: string[],
    weathercode: number[],
    temperature_2m_max: number[],
    temperature_2m_min: number[],
    sunrise: string[],
    sunset: string[],
    precipitation_sum: number[],
    precipitation_probability_max: number[],
    rain_sum: number[],
    showers_sum: number[],
    snowfall_sum: number[],
    precipitation_hours: number[],
    windspeed_10m_max: number[],
    windgusts_10m_max: number[],
    winddirection_10m_dominant: number[],
    shortwave_radiation_sum: number[]
  }
}
