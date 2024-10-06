const redis = require("redis");

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

// Connect to Redis
client.connect().catch((err) => console.error("Redis Client Error", err));

// Function to get data from Redis
const getCachedData = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error getting data from Redis", err);
    return null;
  }
};

// Function to set data to Redis with expiration time
const setCachedData = async (key, value, expiration = 60) => {
  try {
    await client.set(key, JSON.stringify(value), "EX", expiration); // Expiration time in seconds
  } catch (err) {
    console.error("Error setting data to Redis", err);
  }
};

module.exports = { getCachedData, setCachedData };
