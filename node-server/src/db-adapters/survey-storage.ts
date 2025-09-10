import { ICRUDAdapter } from "./nosql-crud-adapter";

let currentId = 1;

/**
 * Abstract survey storage class providing CRUD operations for surveys and responses
 * Uses a generic database adapter to support different storage backends
 */
export class SurveyStorage {
  /**
   * Creates a new SurveyStorage instance
   * @param dbQueryAdapter - Database adapter implementing ICRUDAdapter interface
   */
  constructor(private dbQueryAdapter: ICRUDAdapter) {
    this.dbQueryAdapter = dbQueryAdapter;
  }

  /**
   * Creates a new survey with the specified name
   * @param name - Name for the new survey
   * @param callback - Callback function called with the created survey object
   */
  public addSurvey(name: string, callback: any) {
    const newObj: any = {
      name: name || ("New Survey" + " " + currentId++),
      json: "{}"
    };
    this.dbQueryAdapter.create("surveys", newObj, (id: string) => {
      newObj.id = id;
      callback(newObj);
    });
  }

  /**
   * Stores survey response results in the database
   * @param postId - Survey ID that the response belongs to
   * @param json - Response data object
   * @param callback - Callback function called with the stored response object
   */
  public postResults(postId: string, json: any, callback: any) {
    const newObj: any = {
      surveyId: postId,
      userId: "user_1001",
      answers: json,
      createdAt: new Date(),
    };
    this.dbQueryAdapter.create("responses", newObj, (id: string) => {
      newObj.id = id;
      callback(newObj);
    });
  }

  /**
   * Retrieves a specific survey by its ID
   * @param surveyId - Unique identifier of the survey to retrieve
   * @param callback - Callback function called with the survey object
   */
  public getSurvey(surveyId: string, callback: any) {
    this.dbQueryAdapter.retrieve("surveys", [{ name: "id", op: "=", value: surveyId }], (results: any) => { callback(results[0]); });
  }
  /**
   * Updates the JSON configuration of an existing survey
   * @param id - Survey ID to update
   * @param _ - Unused parameter (kept for compatibility)
   * @param json - New JSON configuration for the survey
   * @param callback - Callback function called with the update result
   */
  public storeSurvey(id: string, _: any, json: any, callback: any) {
    this.dbQueryAdapter.update("surveys", { id: id, json: json }, (results: any) => { callback(results); });
  }
  /**
   * Retrieves all surveys from the database
   * @param callback - Callback function called with array of all surveys
   */
  public getSurveys(callback: any) {
    this.dbQueryAdapter.retrieve("surveys", [], (results: any) => { callback(results); });
  }
  /**
   * Deletes a survey by its ID
   * @param surveyId - Unique identifier of the survey to delete
   * @param callback - Callback function called with the deletion result
   */
  public deleteSurvey(surveyId: string, callback: any) {
    this.dbQueryAdapter.delete("surveys", surveyId, (results: any) => { callback(results); });
  }
  /**
   * Retrieves all responses for a specific survey
   * @param postId - Survey ID to get responses for
   * @param callback - Callback function called with response data object
   */
  public getResults(postId: string, callback: any) {
    this.dbQueryAdapter.retrieve("responses", [{ name: "surveyId", op: "=", value: postId }], (results: any) => { callback({ id: postId, data: results.map((r: any) => r.answers) }); });
  }
  /**
   * Updates the name of an existing survey
   * @param id - Survey ID to update
   * @param name - New name for the survey
   * @param callback - Callback function called with the update result
   */
  public changeName(id: string, name: string, callback: any) {
    this.dbQueryAdapter.update("surveys", { id: id, name: name }, (results: any) => { callback(results); });
  }
}
