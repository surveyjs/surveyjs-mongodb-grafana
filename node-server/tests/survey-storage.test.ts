import { SurveyStorage } from '../src/db-adapters/survey-storage';
import { NoSqlCrudAdapter } from '../src/db-adapters/nosql-crud-adapter';
import { MongoStorage } from '../src/db-adapters/mongo';

describe('SurveyStorage', () => {
  let mockAdapter: any;
  let storage: SurveyStorage;

  beforeEach(() => {
    mockAdapter = {
      create: jest.fn((col, obj, cb) => cb('id123')),
      retrieve: jest.fn((col, filter, cb) => cb([{ id: 'id123', name: 'Test', json: '{}' }])) ,
      update: jest.fn((col, obj, cb) => cb('updated')),
      delete: jest.fn((col, id, cb) => cb('deleted')),
    };
    storage = new SurveyStorage(mockAdapter);
  });

  it('addSurvey should create a new survey', done => {
    storage.addSurvey('Test Survey', result => {
      expect(result).toHaveProperty('id', 'id123');
      expect(result).toHaveProperty('name', 'Test Survey');
      expect(mockAdapter.create).toHaveBeenCalledWith('surveys', expect.any(Object), expect.any(Function));
      done();
    });
  });

  it('postResults should create a new response', done => {
    storage.postResults('survey1', { a: 1 }, result => {
      expect(result).toHaveProperty('id', 'id123');
      expect(result).toHaveProperty('surveyId', 'survey1');
      expect(result).toHaveProperty('answers');
      expect(mockAdapter.create).toHaveBeenCalledWith('responses', expect.any(Object), expect.any(Function));
      done();
    });
  });

  it('getSurvey should retrieve a survey', done => {
    storage.getSurvey('id123', result => {
      expect(result).toHaveProperty('id', 'id123');
      expect(mockAdapter.retrieve).toHaveBeenCalledWith('surveys', [{ name: 'id', op: '=', value: 'id123' }], expect.any(Function));
      done();
    });
  });

  it('storeSurvey should update a survey', done => {
    storage.storeSurvey('id123', null, { foo: 'bar' }, result => {
      expect(result).toBe('updated');
      expect(mockAdapter.update).toHaveBeenCalledWith('surveys', { id: 'id123', json: { foo: 'bar' } }, expect.any(Function));
      done();
    });
  });

  it('getSurveys should retrieve all surveys', done => {
    storage.getSurveys(result => {
      expect(Array.isArray(result)).toBe(true);
      expect(mockAdapter.retrieve).toHaveBeenCalledWith('surveys', [], expect.any(Function));
      done();
    });
  });

  it('deleteSurvey should delete a survey', done => {
    storage.deleteSurvey('id123', result => {
      expect(result).toBe('deleted');
      expect(mockAdapter.delete).toHaveBeenCalledWith('surveys', 'id123', expect.any(Function));
      done();
    });
  });

  it('getResults should retrieve responses for a survey', done => {
    mockAdapter.retrieve.mockImplementation((col, filter, cb) => cb([{ answers: { a: 1 } }]));
    storage.getResults('survey1', result => {
      expect(result).toHaveProperty('id', 'survey1');
      expect(Array.isArray(result.data)).toBe(true);
      expect(mockAdapter.retrieve).toHaveBeenCalledWith('responses', [{ name: 'surveyId', op: '=', value: 'survey1' }], expect.any(Function));
      done();
    });
  });

  it('changeName should update the survey name', done => {
    storage.changeName('id123', 'New Name', result => {
      expect(result).toBe('updated');
      expect(mockAdapter.update).toHaveBeenCalledWith('surveys', { id: 'id123', name: 'New Name' }, expect.any(Function));
      done();
    });
  });
});

describe('NoSqlCrudAdapter', () => {
  let db: any;
  let adapter: NoSqlCrudAdapter<any>;
  let dbConnectFn: any;
  let getId: any;

  beforeEach(() => {
    getId = jest.fn(() => 'newid');
    db = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([{ id: 'id1' }]),
        deleteMany: jest.fn().mockResolvedValue('deleted'),
        insertOne: jest.fn().mockResolvedValue({ id: getId() }),
        updateOne: jest.fn().mockResolvedValue('updated'),
      })
    };
    dbConnectFn = (cb: any) => cb(db, jest.fn());
    adapter = new NoSqlCrudAdapter(dbConnectFn, getId);
  });

  it('retrieve should call find and toArray', done => {
    adapter.retrieve('col', [], results => {
      expect(db.collection).toHaveBeenCalledWith('col');
      expect(db.collection().find).toHaveBeenCalled();
      expect(db.collection().toArray).toHaveBeenCalled();
      expect(results).toEqual([{ id: 'id1' }]);
      done();
    });
  });

  it('delete should call deleteMany', done => {
    adapter.delete('col', 'id1', results => {
      expect(db.collection).toHaveBeenCalledWith('col');
      expect(db.collection().deleteMany).toHaveBeenCalledWith({ id: 'id1' });
      expect(results).toBe('deleted');
      done();
    });
  });

  it('create should call insertOne and assign id', done => {
    const obj: any = {};
    adapter.create('col', obj, id => {
      expect(obj.id).toBe('newid');
      expect(db.collection().insertOne).toHaveBeenCalledWith(obj);
      expect(id).toBe('newid');
      done();
    });
  });

  it('update should call updateOne', done => {
    const obj = { id: 'id1', foo: 'bar' };
    adapter.update('col', obj, results => {
      expect(db.collection().updateOne).toHaveBeenCalledWith({ id: 'id1' }, { $set: obj });
      expect(results).toBe('updated');
      done();
    });
  });
});

describe('MongoStorage', () => {
  it('should construct and delegate to NoSqlCrudAdapter', () => {
    const db: any = {};
    const storage = new MongoStorage(db);
    expect(storage).toBeInstanceOf(MongoStorage);
    expect(storage).toBeInstanceOf(SurveyStorage);
  });
}); 