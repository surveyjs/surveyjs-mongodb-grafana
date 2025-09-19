# SurveyJS Analytics Service

A Node.js backend service that powers survey lifecycle management, response collection, and advanced analytics. It is a core component of the SurveyJS&ndash;Grafana integration, providing structured storage, fast processing, and APIs for visualization.

## Key Features

- Survey management
  - CRUD operations on surveys 
  - MongoDB survey storage
  - Automated response collection and storage
  - Survey metadata management (name and survey configuration)
- Analytics engine
  - Both in-memory and MongoDB aggregation
  - Support for all SurveyJS question types
  - Mean, median, mode, distribution, and percentile calculations
  - Real-time updates on new responses
- Natural language processing (NLP) for responses longer than 15 characters
- Grafana data source API implementation
- Redis-based caching for improved performance
- Health checks for all services

## Technology Stack

- [SurveyJS Core](https://www.npmjs.com/package/survey-core) &ndash; Survey model and question types.
- [NLP Service](../nlp-service/readme.md) &ndash; Service for text analysis.
- [Express.js](https://expressjs.com/) &ndash; Web application framework.
- [MongoDB](https://www.mongodb.com/) &ndash; Primary database.
- [Redis](https://redis.io/) &ndash; Database for caching.
- [Node.js](https://nodejs.org/) &ndash; Runtime environment.

## How It Works

The service handles survey creation, response collection, and analytics in a unified workflow. Surveys are defined in JSON and stored in MongoDB, while responses are submitted by users and saved with additional metadata (date, survey ID, and user ID). Textual answers that exceed a certain length are forwarded to an NLP service for sentiment analysis, entity extraction, and keyword detection.

Analytics are recalculated whenever new responses arrive. Depending on dataset size, the system chooses between in-memory calculations for smaller data or MongoDB aggregations for larger volumes. Processed results are cached in Redis to reduce repeated computation and speed up queries. Grafana retrieves this data through a dedicated API rather than connecting to MongoDB directly, which ensures consistent queries and real-time updates in dashboards.

## API Endpoints

### Survey Management & Analytics API

| Method | Endpoint | Description | Body |
|--------|---------|------------|------|
| GET    | `/api/getActive` | Retrieves all active surveys. | — |
| GET    | `/api/getSurvey?surveyId={id}` | Gets a specific survey by ID. | — |
| GET    | `/api/create?name={name}` | Creates a new survey. | — |
| GET    | `/api/delete?id={id}` | Deletes a survey by ID. | — |
| GET    | `/api/changeName?id={id}&name={name}` | Updates a survey name. | — |
| POST   | `/api/changeJson` | Updates a survey JSON configuration. | `{ "id": "survey_id", "json": "survey_json" }` |
| GET    | `/api/results?postId={id}` | Retrieves survey responses. | — |
| POST   | `/api/post` | Submits a survey response. | `{ "postId": "survey_id", "surveyResult": {...} }` |
| GET    | `/api/stats/{surveyId}/{questionId}` | Retrieves statistics for a specific question. | — |
| GET    | `/api/health` | Service health check. | — |

### Grafana Data Source API

| Method | Endpoint | Description |
|--------|---------|------------|
| GET    | `/grafana/` | Returns API information and available routes. |
| POST   | `/grafana/search` | Searches surveys and questions for Grafana. |
| POST   | `/grafana/query` | Queries survey data for Grafana dashboards. |
| GET    | `/grafana/annotations` | Retrieves annotations for time series. |

## Configuration

The service is configured through [environment variables](.env):

- `PORT` defines the port on which the server listens (default: 8001).
- `MONGO_URI` sets the MongoDB connection string.
- `REDIS_URL` provides the Redis connection string.
- `NLP_SERVICE_URL` specifies the NLP service endpoint (default: http://localhost:5000).
- `DATABASE_LOG` enables or disables database operation logging.

## Database Schema

### Surveys Collection

```json
{
  "_id": "survey_id",
  "name": "Survey Name",
  "json": "SurveyJS JSON configuration"
}
```

### Responses Collection

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

## Setup

The service is containerized and runs as part of the Docker Compose stack:

- **Port**: 3000
- **Network**: analytics-net
- **Dependencies**: MongoDB, Redis, NLP Service

To run the Node Server locally, do the following:

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

## Usage Examples

```bash
# Create a survey
curl "http://localhost:3000/api/create?name=Customer%20Feedback"

# Submit a response
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d '{"postId": "survey_id", "surveyResult": {"q1": "Excellent service!"}}'

# Retrieve analytics
curl "http://localhost:3000/api/stats/survey_id/question_1"

# Query data for Grafana
curl -X POST http://localhost:3000/grafana/query \
  -H "Content-Type: application/json" \
  -d '{"targets": [{"surveyId": "survey_id", "questionId": "q1"}]}'
```