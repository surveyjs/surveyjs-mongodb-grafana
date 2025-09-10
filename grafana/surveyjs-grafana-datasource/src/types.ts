import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * SurveyJS-specific query interface extending Grafana DataQuery
 * Defines parameters for querying survey data and analytics
 */
export interface SurveyJSQuery extends DataQuery {
  /** Survey identifier to query data from */
  surveyId?: string;
  /** Question identifier to analyze within the survey */
  questionId?: string;
  /** Additional query parameters for filtering or analysis */
  queryText?: string;
}

/**
 * Default query configuration for SurveyJS data source
 * Provides fallback values for query parameters
 */
export const defaultQuery: Partial<SurveyJSQuery> = {
};

/**
 * Configuration options for SurveyJS data source instances
 * These are options configured for each DataSource instance
 */
export interface SurveyJSDataSourceOptions extends DataSourceJsonData {
  /** Backend service URL for SurveyJS API */
  url: string;
  /** Optional additional path for API endpoints */
  path?: string;
}

/**
 * Secure configuration data for SurveyJS data source
 * Values that are used in the backend, but never sent over HTTP to the frontend
 */
export interface SurveyJSSecureJsonData {
  /** API key for authenticating with the backend service */
  apiKey?: string;
}
