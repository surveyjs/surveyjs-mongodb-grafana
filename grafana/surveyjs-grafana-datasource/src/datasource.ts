import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  SelectableValue,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { SurveyJSQuery, SurveyJSDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<SurveyJSQuery, SurveyJSDataSourceOptions> {
  async getOptions(surveyId?: string): Promise<SelectableValue[]> {
    const response = await this.doRequest({
      url: '/search',
      method: 'POST',
      data: {
        query: {
          refId: surveyId ? 'questions' : null,
          surveyId: surveyId,
          queryText: ''
        },
      },
    });
    return response.data.map((q: any) => ({
      label: q.label || q.name || q.title || q.text || q.value || q.id || q,
      value: q.value || q.id || q,
    }));
  }

  async doRequest(options: any): Promise<any> {
    options.withCredentials = this._instanceSettings.withCredentials;
    options.headers = {'Content-Type': 'application/json'};
    return getBackendSrv().datasourceRequest({
      ...options,
      url: this._instanceSettings.url + options.url,
      // url: this._instanceSettings.jsonData.url + options.url,
    });
  }

  private _instanceSettings: DataSourceInstanceSettings<SurveyJSDataSourceOptions>;
  constructor(instanceSettings: DataSourceInstanceSettings<SurveyJSDataSourceOptions>) {
    super(instanceSettings);
    this._instanceSettings = instanceSettings;
  }

  async query(options: DataQueryRequest<SurveyJSQuery>): Promise<DataQueryResponse> {
    const response = await this.doRequest({
      url: '/query',
      method: 'POST',
      data: options
    });
    const data = response.data.map((targetData: any, targetIndex: number) => {
      const query = defaults(options.targets[targetIndex], defaultQuery);
      if(targetData.type === 'single_choice' || targetData.type === 'multiple_choice') {
        return new MutableDataFrame({
          fields: [
            { name: "Choice", type: FieldType.string, values: Object.keys(targetData.choices) },
            { name: "Count", type: FieldType.number, values: Object.keys(targetData.choices).map(choice => [targetData.choices[choice]]) }
          ],
          refId: query.refId,
          meta: {
            preferredVisualisationType: 'graph',
          },         
        });      
      } else if(targetData.type === 'number' || targetData.type === 'date' || targetData.type === 'rating') {
        if(query.queryText === 'values') {
          if(targetData.type === 'date') {
            return new MutableDataFrame({
              fields: [
                // { name: 'Time', type: FieldType.time, values: targetData.values.map((v: string) => Date.parse(v as string)) },
                // { name: 'Count', type: FieldType.number, values: targetData.values.map((v: string) => 1) },
                { name: 'Values', type: FieldType.number, values: targetData.values.map((v: string) => Date.parse(v as string)) },
              ],
              refId: query.refId,
            });      
          } else {
            return new MutableDataFrame({
              fields: [
                { name: "Values", type: FieldType.number, values: targetData.values },
              ],
              refId: query.refId,
            });      
          }
        }
        return new MutableDataFrame({
          fields: [
            { name: "Count", type: FieldType.number, values: [targetData.count] },
            { name: "Average", type: FieldType.number, values: [targetData.average] },
            { name: "Min", type: FieldType.number, values: [targetData.min] },
            { name: "Max", type: FieldType.number, values: [targetData.max] },
            { name: "Median", type: FieldType.number, values: [targetData.median] },
            { name: "Mode", type: FieldType.number, values: [targetData.mode] },
          ],
          refId: query.refId,
          meta: {
            preferredVisualisationType: 'table',
          },         
        });      
      } else if(targetData.type === 'ranking') {
        return new MutableDataFrame({
          fields: [
            { name: "Choice", type: FieldType.string, values: Object.keys(targetData.averageRankings) },
            { name: "Average Rank", type: FieldType.number, values: Object.keys(targetData.averageRankings).map(choice => targetData.averageRankings[choice]) }
          ],
          refId: query.refId,
          meta: {
            preferredVisualisationType: 'graph',
          },         
        });      
      } else if(targetData.type === 'text') {
        return new MutableDataFrame({
          fields: [
            { name: "Count", type: FieldType.number, values: [targetData.count ? targetData.count : 0] },
            { name: "Average Length", type: FieldType.number, values: [targetData.averageLength ? targetData.averageLength : 0] },
            { name: "Median Length", type: FieldType.number, values: [targetData.medianLength ? targetData.medianLength : 0] },
            { name: "Average Polarity", type: FieldType.number, values: [targetData.sentimentAnalysis?.average ? targetData.sentimentAnalysis?.average : 0] },
            { name: "Positive", type: FieldType.number, values: [targetData.sentimentAnalysis?.positive ? targetData.sentimentAnalysis?.positive : 0] },
            { name: "Negative", type: FieldType.number, values: [targetData.sentimentAnalysis?.negative ? targetData.sentimentAnalysis?.negative : 0] },
            { name: "Neutral", type: FieldType.number, values: [targetData.sentimentAnalysis?.neutral ? targetData.sentimentAnalysis?.neutral : 0] },
            { name: "Common Words", type: FieldType.other, values: targetData.commonWords },
          ],
          refId: query.refId,
        });      
      }
      return new MutableDataFrame({
        fields: [
          { name: "Count", type: FieldType.number, values: [targetData.count || 0] },
        ],
        refId: query.refId,
      });      
      // return new MutableDataFrame({
      //   fields: targetData.columns.map((c: any, i: number) => ({
      //     name: c.text,
      //     type: ((type) => { switch(type) {
      //       case 'string': return FieldType.string;
      //       case 'number': return FieldType.number;
      //       default: return FieldType.string;
      //     }
      //     })(c.type),
      //     values: targetData.rows.map((r: any) => r[i])
      //   })),
      //   refId: query.refId,
      //   meta: {
      //     preferredVisualisationType: 'graph',
      //   },         
      // });      
    });

    // const { range } = options;
    // const from = range!.from.valueOf();
    // const to = range!.to.valueOf();
    
    // const data = options.targets.map(target => {
    //   const query = defaults(target, defaultQuery);
    //   return new MutableDataFrame({
    //     refId: query.refId,
    //     fields: [
    //       { name: 'Time', values: [from, to], type: FieldType.time },
    //       { name: 'Value', values: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)], type: FieldType.number },
    //     ],
    //   });
    // });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    const test = await this.doRequest({
      url: '/',
      method: 'GET'
    });    
    return !!test && test.status === 200 ? {
      ...test.response,
      status: 'success',
      message: 'Success',
    } : {
      status: 'error',
      message: 'Error connecting to the data source',
    };
  }
}
