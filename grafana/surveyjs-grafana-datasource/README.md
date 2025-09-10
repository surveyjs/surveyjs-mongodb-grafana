
# SurveyJS Grafana Data Source Plugin

A comprehensive Grafana data source plugin that enables visualization and analysis of SurveyJS survey responses through interactive dashboards and charts.

## Overview

The SurveyJS Grafana Data Source Plugin provides seamless integration between SurveyJS survey data and Grafana's powerful visualization capabilities. It connects to the SurveyJS MongoDB backend service to retrieve survey responses and analytics, transforming them into Grafana-compatible data frames for rich dashboard visualizations.

## Features

### Survey Data Integration
- **Survey Selection**: Dynamic dropdown selection of available surveys
- **Question Selection**: Automatic population of questions based on selected survey
- **Real-time Data**: Live connection to survey response data
- **Multiple Question Types**: Support for all SurveyJS question types

### Question Type Support
- **Choice Questions**: Single and multiple choice with popularity charts
- **Numeric Questions**: Statistical analysis with mean, median, mode, percentiles
- **Date Questions**: Temporal analysis with time series and histograms
- **Rating Questions**: Rating distribution and statistical summaries
- **Ranking Questions**: Preference analysis with average rankings
- **Text Questions**: Sentiment analysis, word frequency, and length statistics

### Visualization Types
- **Graphs**: Bar charts, line charts, and pie charts for choice data
- **Tables**: Statistical summaries for numeric and rating data
- **Time Series**: Temporal analysis for date-based questions
- **Histograms**: Distribution analysis for various data types

### Advanced Analytics
- **Sentiment Analysis**: NLP-powered sentiment scoring for text responses
- **Statistical Calculations**: Comprehensive statistical analysis
- **Data Aggregation**: Efficient data processing and caching
- **Custom Queries**: Flexible querying with additional parameters

## Architecture

### Plugin Components

#### Data Source (`datasource.ts`)
- **Backend Integration**: Communicates with SurveyJS Node.js backend
- **Data Transformation**: Converts survey data to Grafana data frames
- **Query Processing**: Handles complex survey and question queries
- **Health Monitoring**: Provides connection status and error handling

#### Configuration Editor (`ConfigEditor.tsx`)
- **URL Configuration**: Backend service endpoint setup
- **Path Configuration**: Optional API path customization
- **Security**: API key management for secure connections
- **Validation**: Connection testing and configuration validation

#### Query Editor (`QueryEditor.tsx`)
- **Survey Selection**: Dynamic survey dropdown with real-time loading
- **Question Selection**: Context-aware question selection based on survey
- **Query Parameters**: Additional query text for advanced filtering
- **Real-time Updates**: Automatic query execution on parameter changes

#### Type Definitions (`types.ts`)
- **Query Interface**: SurveyJS-specific query parameters
- **Configuration Options**: Data source configuration schema
- **Security Data**: Secure credential management interface

### Data Flow

1. **Configuration**: User configures data source with backend URL and credentials
2. **Survey Discovery**: Plugin queries backend for available surveys
3. **Question Loading**: Questions are loaded based on selected survey
4. **Query Execution**: User selects survey and question for analysis
5. **Data Retrieval**: Backend processes analytics and returns structured data
6. **Data Transformation**: Plugin converts data to Grafana data frames
7. **Visualization**: Grafana renders charts and tables based on data type

## API Integration

### Backend Communication
The plugin communicates with the SurveyJS Node.js backend through REST API calls:

#### Survey Discovery
- **Endpoint**: `POST /search`
- **Purpose**: Retrieve available surveys and questions
- **Parameters**: Optional surveyId for question filtering

#### Data Querying
- **Endpoint**: `POST /query`
- **Purpose**: Execute analytics queries for selected survey questions
- **Parameters**: Survey ID, question ID, and additional query parameters

#### Health Check
- **Endpoint**: `GET /`
- **Purpose**: Verify backend connectivity and service status

### Data Frame Generation

The plugin intelligently transforms survey analytics into appropriate Grafana data frames:

#### Choice Questions
```typescript
// Generates graph-compatible data frame
{
  fields: [
    { name: "Choice", type: FieldType.string, values: ["Option1", "Option2"] },
    { name: "Count", type: FieldType.number, values: [10, 15] }
  ],
  meta: { preferredVisualisationType: 'graph' }
}
```

#### Numeric Questions
```typescript
// Generates table-compatible data frame
{
  fields: [
    { name: "Count", type: FieldType.number, values: [25] },
    { name: "Average", type: FieldType.number, values: [7.5] },
    { name: "Median", type: FieldType.number, values: [8.0] }
  ],
  meta: { preferredVisualisationType: 'table' }
}
```

#### Text Questions
```typescript
// Generates sentiment analysis data frame
{
  fields: [
    { name: "Average Polarity", type: FieldType.number, values: [0.3] },
    { name: "Positive", type: FieldType.number, values: [15] },
    { name: "Negative", type: FieldType.number, values: [5] },
    { name: "Neutral", type: FieldType.number, values: [10] }
  ]
}
```

## Configuration

### Data Source Setup

1. **Add Data Source**: Navigate to Grafana Configuration → Data Sources
2. **Select Plugin**: Choose "SurveyJS Responses Datasource"
3. **Configure URL**: Enter backend service URL (e.g., `http://localhost:3000/grafana`)
4. **Optional Path**: Specify additional API path if needed
5. **API Key**: Configure secure API key if required
6. **Test Connection**: Verify connectivity to backend service

### Query Configuration

1. **Select Survey**: Choose from available surveys in dropdown
2. **Select Question**: Pick specific question for analysis
3. **Query Text**: Add additional filtering parameters (optional)
4. **Visualization**: Choose appropriate chart type based on data

## Technology Stack

### Core Technologies
- **React**: Frontend component framework
- **TypeScript**: Type-safe development
- **Grafana SDK**: Plugin development framework
- **Lodash**: Utility functions for data manipulation

### Grafana Integration
- **@grafana/data**: Data frame and query interfaces
- **@grafana/ui**: UI components and form controls
- **@grafana/runtime**: Backend service communication
- **@grafana/toolkit**: Development and build tools

### Development Tools
- **Grafana Toolkit**: Plugin development and testing
- **Jest**: Unit testing framework
- **Testing Library**: React component testing

## Development

### Prerequisites
- Node.js >= 14
- Yarn package manager
- Grafana development environment

### Local Development

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Development Mode**
   ```bash
   yarn dev
   # or
   yarn watch
   ```

3. **Build Production**
   ```bash
   yarn build
   ```

4. **Run Tests**
   ```bash
   yarn test
   ```

### Plugin Installation

1. **Build Plugin**
   ```bash
   yarn build
   ```

2. **Copy to Grafana**
   ```bash
   cp -r dist/ /var/lib/grafana/plugins/surveyjs-grafana-datasource/
   ```

3. **Restart Grafana**
   ```bash
   systemctl restart grafana-server
   ```

## Usage Examples

### Creating a Survey Response Dashboard

1. **Add Data Source**
   - Configure connection to SurveyJS backend
   - Test connectivity

2. **Create Dashboard**
   - Add new dashboard in Grafana
   - Add panel with SurveyJS data source

3. **Configure Query**
   - Select survey from dropdown
   - Choose question for analysis
   - Select appropriate visualization

4. **Customize Visualization**
   - Choose chart type (graph, table, etc.)
   - Configure display options
   - Add titles and descriptions

### Example Queries

#### Choice Question Analysis
```json
{
  "surveyId": "customer_feedback_2024",
  "questionId": "satisfaction_rating",
  "queryText": ""
}
```

#### Text Sentiment Analysis
```json
{
  "surveyId": "product_feedback",
  "questionId": "comments",
  "queryText": "sentiment"
}
```

#### Date-based Analysis
```json
{
  "surveyId": "event_survey",
  "questionId": "event_date",
  "queryText": "2024"
}
```

## Performance Features

### Caching
- **Backend Caching**: Leverages Redis caching from backend service
- **Query Optimization**: Efficient data retrieval and processing
- **Real-time Updates**: Automatic refresh on data changes

### Error Handling
- **Connection Monitoring**: Automatic health checks
- **Graceful Degradation**: Fallback options for failed queries
- **User Feedback**: Clear error messages and status indicators

## Integration with SurveyJS Ecosystem

### Backend Services
- **Node.js Server**: Primary data source and analytics engine
- **MongoDB**: Survey and response data storage
- **Redis**: Caching layer for performance optimization
- **NLP Service**: Text analysis and sentiment processing

### Data Flow
1. **Survey Creation**: Surveys created via SurveyJS Creator
2. **Response Collection**: Responses stored in MongoDB
3. **Analytics Processing**: Backend processes and caches analytics
4. **Grafana Visualization**: Plugin retrieves and displays data
5. **Dashboard Creation**: Users create interactive dashboards

## Troubleshooting

### Common Issues

#### Connection Problems
- Verify backend service is running
- Check URL configuration
- Ensure network connectivity

#### Data Not Loading
- Verify survey and question IDs
- Check backend service logs
- Test API endpoints directly

#### Visualization Issues
- Ensure appropriate chart type for data
- Check data frame structure
- Verify query parameters

### Debug Mode
Enable debug logging in Grafana configuration to troubleshoot issues:
```json
{
  "log_level": "debug",
  "datasource_logging": true
}
```

## Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use Grafana UI components consistently
- Add comprehensive error handling
- Include unit tests for new features

### Code Structure
- `src/datasource.ts`: Core data source implementation
- `src/ConfigEditor.tsx`: Configuration interface
- `src/QueryEditor.tsx`: Query building interface
- `src/types.ts`: Type definitions and interfaces
- `src/module.ts`: Plugin registration and setup

## License

Apache-2.0 License - See LICENSE file for details.

## Support

For issues and feature requests, please refer to the project repository or contact the development team.

## Learn more

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System