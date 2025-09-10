# Node Server - SurveyJS Analytics Service

A comprehensive Node.js backend service that provides survey management, data collection, and advanced analytics capabilities for the SurveyJS MongoDB Grafana integration project.

## Overview

The Node Server is the core backend service that handles survey lifecycle management, response collection, and provides sophisticated analytics through multiple data processing engines. It integrates with MongoDB for data persistence, Redis for caching, and the NLP service for text analysis.

## Features

### Survey Management
- **Survey CRUD Operations**: Create, read, update, and delete surveys
- **Survey Storage**: MongoDB-based persistent storage with JSON schema support
- **Response Collection**: Automated response processing and storage
- **Survey Metadata**: Name management and survey configuration

### Analytics Engine
- **Multi-Engine Support**: Both in-memory and MongoDB aggregation analytics
- **Question Type Analysis**: Support for all SurveyJS question types
- **Statistical Calculations**: Mean, median, mode, percentiles, distributions
- **Real-time Processing**: Automatic analytics updates on new responses

### Question Type Support
- **Numeric Questions**: Statistical analysis with percentiles and distributions
- **Date Questions**: Temporal analysis with monthly/yearly breakdowns
- **Choice Questions**: Single and multiple choice analysis with popularity metrics
- **Rating Questions**: Rating distribution and statistical analysis
- **Ranking Questions**: Preference analysis and ranking statistics
- **Text Questions**: Length analysis, sentiment analysis, and common word extraction

### Integration Features
- **NLP Integration**: Automatic text analysis for responses longer than 15 characters
- **Grafana Data Source**: Full Grafana datasource API implementation
- **Caching Layer**: Redis-based caching for improved performance
- **Health Monitoring**: Comprehensive health checks for all services

## API Endpoints

### Survey Management API (`/api`)

#### Survey Operations
- **GET** `/api/getActive` - Retrieve all active surveys
- **GET** `/api/getSurvey?surveyId={id}` - Get specific survey by ID
- **GET** `/api/create?name={name}` - Create new survey
- **GET** `/api/delete?id={id}` - Delete survey by ID
- **GET** `/api/changeName?id={id}&name={name}` - Update survey name
- **POST** `/api/changeJson` - Update survey JSON configuration
  - Body: `{"id": "survey_id", "json": "survey_json"}`

#### Response Operations
- **GET** `/api/results?postId={id}` - Get survey responses
- **POST** `/api/post` - Submit survey response
  - Body: `{"postId": "survey_id", "surveyResult": {...}}`

### Analytics API (`/api`)

#### Statistics
- **GET** `/api/stats/{surveyId}/{questionId}` - Get question statistics
- **GET** `/api/health` - Service health check

### Grafana Data Source API (`/grafana`)

#### Grafana Integration
- **GET** `/grafana/` - API information and available routes
- **POST** `/grafana/search` - Search surveys and questions for Grafana
- **POST** `/grafana/query` - Query data for Grafana dashboards
- **GET** `/grafana/annotations` - Get annotations for time series

## Technology Stack

### Core Technologies
- **Node.js**: Runtime environment
- **TypeScript**: Type-safe development
- **Express.js**: Web framework
- **MongoDB**: Primary database
- **Redis**: Caching layer

### Survey Framework
- **SurveyJS Core**: Survey model and question types
- **Survey Storage**: Custom storage adapter for MongoDB

### Analytics Libraries
- **Custom Analytics Engine**: In-memory and MongoDB aggregation
- **Statistical Functions**: Median, mode, percentile calculations
- **NLP Integration**: Text analysis via external service

## Architecture

### Service Components

#### Database Layer
- **MongoDB Connection**: Primary data persistence
- **Redis Cache**: Performance optimization
- **Connection Management**: Singleton pattern for database connections

#### Storage Adapters
- **MongoStorage**: MongoDB-specific survey storage
- **NoSqlCrudAdapter**: Generic NoSQL CRUD operations
- **SurveyStorage**: Abstract survey storage interface

#### Analytics Services
- **SurveyAnalytics**: Base analytics class with caching
- **SurveyAnalyticsInMemory**: In-memory analytics processing
- **SurveyAnalyticsMongo**: MongoDB aggregation analytics

#### Route Handlers
- **Main API Routes**: Survey and response management
- **Grafana Routes**: Grafana datasource integration
- **Health Routes**: Service monitoring

### Data Flow

1. **Survey Creation**: User creates survey → Stored in MongoDB
2. **Response Submission**: User submits response → Stored with metadata
3. **Analytics Processing**: Response triggers analytics calculation
4. **NLP Processing**: Text responses sent to NLP service
5. **Cache Update**: Analytics results cached in Redis
6. **Grafana Integration**: Data exposed via Grafana API

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `NLP_SERVICE_URL`: NLP service endpoint (default: http://nlp-service:5000)
- `DATABASE_LOG`: Enable database operation logging

### Database Schema

#### Surveys Collection
```json
{
  "_id": "survey_id",
  "name": "Survey Name",
  "json": "SurveyJS JSON configuration"
}
```

#### Responses Collection
```json
{
  "_id": "response_id",
  "surveyId": "survey_id",
  "userId": "user_1001",
  "answers": {...},
  "createdAt": "2024-01-01T00:00:00Z",
  "nlp": {
    "questionId": {
      "sentiment": {...},
      "entities": [...],
      "key_phrases": [...]
    }
  }
}
```

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Docker Deployment
The service is containerized and runs as part of the Docker Compose stack:
- **Port**: 3000
- **Network**: analytics-net
- **Dependencies**: MongoDB, Redis, NLP Service

## Performance Features

### Caching Strategy
- **Analytics Caching**: 15-minute TTL for question statistics
- **Cache Invalidation**: Automatic cache clearing on data updates
- **Redis Integration**: Distributed caching for scalability

### Optimization
- **MongoDB Aggregation**: Efficient database queries for large datasets
- **In-Memory Processing**: Fast analytics for smaller datasets
- **Connection Pooling**: Optimized database connections

## Monitoring

### Health Checks
- **Database Connectivity**: MongoDB and Redis connection status
- **Service Status**: Overall service health
- **Timestamp Tracking**: Response time monitoring

### Error Handling
- **Graceful Degradation**: Service continues with reduced functionality
- **Error Logging**: Comprehensive error tracking
- **NLP Fallback**: Continues without NLP if service unavailable

## Usage Examples

### Create Survey
```bash
curl "http://localhost:3000/api/create?name=Customer%20Feedback"
```

### Submit Response
```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d '{"postId": "survey_id", "surveyResult": {"q1": "Excellent service!"}}'
```

### Get Analytics
```bash
curl "http://localhost:3000/api/stats/survey_id/question_1"
```

### Grafana Query
```bash
curl -X POST http://localhost:3000/grafana/query \
  -H "Content-Type: application/json" \
  -d '{"targets": [{"surveyId": "survey_id", "questionId": "q1"}]}'
```