const redis = require('redis');
const bluebird = require('bluebird');
const config = require('./src/config/config');

// Create Redis client
const client = redis.createClient({
  host: config.session_redis.host,
  port: config.session_redis.port,
  db: config.session_redis.db,
  // password: config.session_redis.password, // if needed
});

bluebird.promisifyAll(client);

// Redis logs
client.on('ready', () => console.log('✅ Redis ready'));
client.on('connect', () => console.log('🔌 Redis connected'));
client.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));
client.on('end', () => console.log('❌ Redis disconnected'));
client.on('error', (err) => {
  console.error('Redis connection error!', err);
  process.exit(1);
});

module.exports = client;
