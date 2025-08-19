import defaults from 'lodash/defaults';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, SurveyJSDataSourceOptions, SurveyJSQuery } from './types';

const { FormField, Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, SurveyJSQuery, SurveyJSDataSourceOptions>;

export const QueryEditor: React.FC<Props> = ({ query, onChange, onRunQuery, datasource }) => {

  const defaultsQuery = defaults(query, defaultQuery);
  const { surveyId, questionId, queryText } = defaultsQuery as SurveyJSQuery;

  const [surveys, setSurveys] = useState<SelectableValue[]>([]);
  const [questions, setQuestions] = useState<SelectableValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
    onRunQuery();
  };

  const onSurveyIdChange = (selected: SelectableValue<string>) => {
    onChange({ ...query, surveyId: selected?.value || '', questionId: '' });
    setQuestions([]);
  };

  const onQuestionIdChange = (selected: SelectableValue<string>) => {
    onChange({ ...query, questionId: selected?.value || '' });
    onRunQuery();
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const surveys = await datasource.getOptions();
        if (isMounted) {
          setSurveys(surveys);
        }
        const questions = await datasource.getOptions(surveyId);
        if (isMounted) {
          setQuestions(questions);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [datasource, surveyId]);

  return (
    <div className="gf-form">
      <Select
        options={surveys}
        value={surveys.find(s => s.value === surveyId)}
        onChange={onSurveyIdChange}
        isLoading={isLoading}
        width={24}
        isClearable={true}
        placeholder='The survey to query'
      />
      <Select
        options={questions}
        value={questions.find(s => s.value === questionId)}
        onChange={onQuestionIdChange}
        isLoading={isLoading}
        width={24}
        isClearable={true}
        placeholder='The question to query'
      />
      <FormField
        labelWidth={8}
        value={queryText || ''}
        onChange={onQueryTextChange}
        label="Query text"
        tooltip="Not used yet"
      />
    </div>
  );
  
}
