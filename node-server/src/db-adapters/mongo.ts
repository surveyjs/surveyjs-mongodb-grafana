import { Db, ObjectId } from "mongodb";
import { NoSqlCrudAdapter } from "./nosql-crud-adapter";
import { SurveyStorage } from "./survey-storage";

const dbConnectFunction = (dbInstance: Db) => (dbCallback: (db: Db, finalize: any) => void) =>{
  dbCallback(dbInstance, function () {
    if (!!process.env.DATABASE_LOG) {
      console.log(arguments[0]);
      console.log(arguments[1]);
    }
  });
}


export class MongoStorage extends SurveyStorage {
  constructor(private dbInstance: Db) {
    super(new NoSqlCrudAdapter<Db>(dbConnectFunction(dbInstance), () => new ObjectId().toString()))
  }
}

