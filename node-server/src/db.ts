import { MongoClient, Db } from 'mongodb';
import { createClient, RedisClientType } from 'redis';

let dbInstance: Db | null = null;

export const connectToDatabase = async (uri: string): Promise<Db> => {
    if (dbInstance) return dbInstance;

    const client = new MongoClient(uri);
    await client.connect();
    dbInstance = client.db('survey_db');
    return dbInstance;
};

export const getDb = (): Db => {
    if (!dbInstance) {
        throw new Error('Database is not initialized!');
    }
    return dbInstance;
};

let redisClientInstance: RedisClientType<any> | null = null;

export const connectToCache = async (url: string): Promise<RedisClientType<any>> => {
    if (redisClientInstance) return redisClientInstance;

    redisClientInstance = createClient({ url });
    await redisClientInstance.connect();

    return redisClientInstance;
};

export const getRedisClient = (): RedisClientType<any> => {
    if (!redisClientInstance) {
        throw new Error('Cache DB is not initialized!');
    }
    return redisClientInstance;
};