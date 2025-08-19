import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { SurveyJSQuery, SurveyJSDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, SurveyJSQuery, SurveyJSDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
