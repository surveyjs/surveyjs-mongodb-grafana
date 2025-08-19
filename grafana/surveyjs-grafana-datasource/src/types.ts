import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface SurveyJSQuery extends DataQuery {
  surveyId?: string;
  questionId?: string;
  queryText?: string;
}

export const defaultQuery: Partial<SurveyJSQuery> = {
};

/**
 * These are options configured for each DataSource instance
 */
export interface SurveyJSDataSourceOptions extends DataSourceJsonData {
  url: string;
  path?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface SurveyJSSecureJsonData {
  apiKey?: string;
}
