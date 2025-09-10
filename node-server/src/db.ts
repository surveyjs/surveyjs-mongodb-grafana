import { MongoClient, Db } from 'mongodb';
import { createClient, RedisClientType } from 'redis';

let dbInstance: Db | null = null;

/**
 * Establishes connection to MongoDB database using singleton pattern
 * @param uri - MongoDB connection URI string
 * @returns Promise resolving to MongoDB database instance
 * @throws Error if connection fails
 */
export const connectToDatabase = async (uri: string): Promise<Db> => {
    if (dbInstance) return dbInstance;

    const client = new MongoClient(uri);
    await client.connect();
    dbInstance = client.db('survey_db');
    return dbInstance;
};

/**
 * Retrieves the MongoDB database instance
 * @returns MongoDB database instance
 * @throws Error if database is not initialized
 */
export const getDb = (): Db => {
    if (!dbInstance) {
        throw new Error('Database is not initialized!');
    }
    return dbInstance;
};

let redisClientInstance: RedisClientType<any> | null = null;

/**
 * Establishes connection to Redis cache using singleton pattern
 * @param url - Redis connection URL string
 * @returns Promise resolving to Redis client instance
 * @throws Error if connection fails
 */
export const connectToCache = async (url: string): Promise<RedisClientType<any>> => {
    if (redisClientInstance) return redisClientInstance;

    redisClientInstance = createClient({ url });
    await redisClientInstance.connect();

    return redisClientInstance;
};

/**
 * Retrieves the Redis client instance
 * @returns Redis client instance
 * @throws Error if Redis client is not initialized
 */
export const getRedisClient = (): RedisClientType<any> => {
    if (!redisClientInstance) {
        throw new Error('Cache DB is not initialized!');
    }
    return redisClientInstance;
};