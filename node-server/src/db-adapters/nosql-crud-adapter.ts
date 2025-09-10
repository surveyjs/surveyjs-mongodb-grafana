import { Db } from "mongodb";

/**
 * Interface defining CRUD operations for NoSQL database adapters
 * Provides a standardized way to interact with different database backends
 */
export interface ICRUDAdapter {
  /**
   * Retrieves documents from a collection based on filter criteria
   * @param collectionName - Name of the collection to query
   * @param filter - Filter criteria for the query
   * @param callback - Callback function called with query results
   */
  retrieve(collectionName: string, filter: any, callback: any): void;
  
  /**
   * Deletes documents from a collection by ID
   * @param collectionName - Name of the collection to delete from
   * @param idValue - ID value to match for deletion
   * @param callback - Callback function called with deletion result
   */
  delete(collectionName: string, idValue: string, callback: any): void;
  
  /**
   * Creates a new document in a collection
   * @param collectionName - Name of the collection to insert into
   * @param object - Document object to create
   * @param callback - Callback function called with creation result
   */
  create(collectionName: string, object: any, callback: any): void;
  
  /**
   * Updates an existing document in a collection
   * @param collectionName - Name of the collection to update
   * @param object - Document object with updated data
   * @param callback - Callback function called with update result
   */
  update(collectionName: string, object: any, callback: any): void;
}

/**
 * Generic NoSQL CRUD adapter implementation
 * Provides database-agnostic CRUD operations using a connection function
 */
export class NoSqlCrudAdapter<DbType extends Db> implements ICRUDAdapter {
  /**
   * Creates a new NoSqlCrudAdapter instance
   * @param dbConnectFunction - Function that provides database connection
   * @param getId - Function that generates unique IDs for new documents
   */
  constructor(private dbConnectFunction: (callback: (db: DbType, finalize: any) => void) => void, private getId: () => string) {
  }

  /**
   * Retrieves documents from the specified collection
   * @param collectionName - Name of the collection to query
   * @param filter - Array of filter objects with name, op, and value properties
   * @param callback - Callback function called with query results
   */
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

  /**
   * Deletes documents from the specified collection by ID
   * @param collectionName - Name of the collection to delete from
   * @param idValue - ID value to match for deletion
   * @param callback - Callback function called with deletion result
   */
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

  /**
   * Creates a new document in the specified collection
   * @param collectionName - Name of the collection to insert into
   * @param object - Document object to create (ID will be generated if not provided)
   * @param callback - Callback function called with the generated ID
   */
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

  /**
   * Updates an existing document in the specified collection
   * @param collectionName - Name of the collection to update
   * @param object - Document object with updated data (must include id field)
   * @param callback - Callback function called with update result
   */
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
