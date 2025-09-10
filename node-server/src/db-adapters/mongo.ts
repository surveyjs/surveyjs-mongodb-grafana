import { Db, ObjectId } from "mongodb";
import { NoSqlCrudAdapter } from "./nosql-crud-adapter";
import { SurveyStorage } from "./survey-storage";

/**
 * Creates a database connection function for MongoDB operations
 * @param dbInstance - MongoDB database instance
 * @returns Function that executes database callbacks with logging support
 */
const dbConnectFunction = (dbInstance: Db) => (dbCallback: (db: Db, finalize: any) => void) =>{
  dbCallback(dbInstance, function () {
    if (!!process.env.DATABASE_LOG) {
      console.log(arguments[0]);
      console.log(arguments[1]);
    }
  });
}


/**
 * MongoDB implementation of SurveyStorage
 * Provides survey and response storage using MongoDB as the backend
 */
export class MongoStorage extends SurveyStorage {
  /**
   * Creates a new MongoStorage instance
   * @param dbInstance - MongoDB database instance to use for storage
   */
  constructor(private dbInstance: Db) {
    super(new NoSqlCrudAdapter<Db>(dbConnectFunction(dbInstance), () => new ObjectId().toString()))
  }
}

