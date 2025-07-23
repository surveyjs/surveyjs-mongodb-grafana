import { ICRUDAdapter } from "./nosql-crud-adapter";

let currentId = 1;

export class SurveyStorage {
  constructor(private dbQueryAdapter: ICRUDAdapter) {
    this.dbQueryAdapter = dbQueryAdapter;
  }

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

  public getSurvey(surveyId: string, callback: any) {
    this.dbQueryAdapter.retrieve("surveys", [{ name: "id", op: "=", value: surveyId }], (results: any) => { callback(results[0]); });
  }
  public storeSurvey(id: string, _: any, json: any, callback: any) {
    this.dbQueryAdapter.update("surveys", { id: id, json: json }, (results: any) => { callback(results); });
  }
  public getSurveys(callback: any) {
    this.dbQueryAdapter.retrieve("surveys", [], (results: any) => { callback(results); });
  }
  public deleteSurvey(surveyId: string, callback: any) {
    this.dbQueryAdapter.delete("surveys", surveyId, (results: any) => { callback(results); });
  }
  public getResults(postId: string, callback: any) {
    this.dbQueryAdapter.retrieve("responses", [{ name: "surveyId", op: "=", value: postId }], (results: any) => { callback({ id: postId, data: results.map((r: any) => r.answers) }); });
  }
  public changeName(id: string, name: string, callback: any) {
    this.dbQueryAdapter.update("surveys", { id: id, name: name }, (results: any) => { callback(results); });
  }
}
