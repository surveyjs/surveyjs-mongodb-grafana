/**
 * SurveyJS Grafana Data Source Plugin Module
 * Registers the plugin with Grafana and configures its components
 */
import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { SurveyJSQuery, SurveyJSDataSourceOptions } from './types';

/**
 * Creates and configures the SurveyJS data source plugin
 * Sets up the data source class, configuration editor, and query editor
 */
export const plugin = new DataSourcePlugin<DataSource, SurveyJSQuery, SurveyJSDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
