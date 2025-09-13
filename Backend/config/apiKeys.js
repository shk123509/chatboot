// API Keys Configuration
// You can get free API keys from these services:
// NewsAPI: https://newsapi.org/register
// GNews: https://gnews.io/register
// TheNewsAPI: https://www.thenewsapi.com/

module.exports = {
  // Primary News API Keys (try multiple in case one fails)
  newsApiKeys: [
    process.env.NEWS_API_KEY,
    '2dbc0baa2206415abae79e6e6b01c766', // Example key
    'pub_568242fca3c9c4e2fb3d2c9f013c1c0f65762', // TheNewsAPI format
  ].filter(Boolean),
  
  // GNews API Keys
  gnewsApiKeys: [
    process.env.GNEWS_API_KEY,
    '634c71d3a3b44539a03e33700e929183',
  ].filter(Boolean),
  
  // Weather API Keys
  weatherApiKeys: [
    process.env.WEATHER_API_KEY,
    'f4a0c8e2b9d4c6a8f7e3b1c9d5e7f2a4',
  ].filter(Boolean),
  
  // Function to rotate through API keys if one fails
  getNextKey: (keyArray, currentIndex = 0) => {
    return keyArray[(currentIndex + 1) % keyArray.length];
  }
};
