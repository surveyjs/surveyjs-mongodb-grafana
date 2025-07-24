import { Db } from "mongodb";

export interface ICRUDAdapter {
  retrieve(collectionName: string, filter: any, callback: any): void;
  delete(collectionName: string, idValue: string, callback: any): void;
  create(collectionName: string, object: any, callback: any): void;
  update(collectionName: string, object: any, callback: any): void;
}

export class NoSqlCrudAdapter<DbType extends Db> implements ICRUDAdapter {
  constructor(private dbConnectFunction: (callback: (db: DbType, finalize: any) => void) => void, private getId: () => string) {
  }

  public retrieve(collectionName: string, filter: any, callback: any) {
    filter = filter || [];
    let query: any = {};
    filter.forEach((fi: any) => query[fi.name] = fi.value);
    this.dbConnectFunction((db: DbType, finalizeCallback: any) => {
      db.collection(collectionName).find(query).toArray()
        .then((results: any) => {
          callback(results);
          finalizeCallback(results);
        })
        .catch(() => {
          console.error(JSON.stringify(arguments));
        });
      }
    );
  }

  public delete(collectionName: string, idValue: string, callback: any) {
    this.dbConnectFunction((db: DbType, finalizeCallback: any) => {
      db.collection(collectionName).deleteMany({ id: idValue })
        .then((results: any) => {
          callback(results);
          finalizeCallback(results);
        })
        .catch(() => {
          console.error(JSON.stringify(arguments));
        });
      }
    );
  }

  public create(collectionName: string, object: any, callback: any) {
    object.id = object.id || this.getId();
    this.dbConnectFunction((db: DbType, finalizeCallback: any) => {
      db.collection(collectionName).insertOne(object)
        .then((results: any) => {
          callback(results.id);
          finalizeCallback(results);
        })
        .catch(() => {
          console.error(JSON.stringify(arguments));
        });
      }
    );
  }

  public update(collectionName: string, object: any, callback: any) {
    this.dbConnectFunction((db: DbType, finalizeCallback: any) => {
      db.collection(collectionName).updateOne({ id: object.id }, { $set: object })
        .then((results: any) => {
          callback(results);
          finalizeCallback(results);
        })
        .catch(() => {
          console.error(JSON.stringify(arguments));
        });
      }
    );
  }
}
