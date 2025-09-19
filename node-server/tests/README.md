# Survey Analytics Testing

This directory contains comprehensive unit and integration tests for the Survey Analytics service.

## Test Structure

- `analytics-in-memory.test.ts` - Unit tests for the `SurveyAnalyticsInMemory` class.
- `analytics-mongo.test.ts` - Unit tests for the `SurveyAnalyticsMongo` class.
- `utils.test.ts` - Unit tests for utility functions (median, mode, percentile, ranking stats).
- `integration.test.ts` - End-to-end tests using real MongoDB and Redis instances.

## Setup

### Prerequisites

- Node.js v16 or higher
- MongoDB instance (for integration tests)
- Redis instance (for integration tests)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.test` file for integration tests:

```env
MONGODB_TEST_URL=mongodb://localhost:27017/test_analytics
REDIS_TEST_URL=redis://localhost:6379
NLP_SERVICE_URL=http://localhost:5000
```

## Run Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm test -- --testPathPattern="(unit|analytics|utils)"

# Run only integration tests
npm test -- --testPathPattern="integration"

# Watch mode
npm run test:watch

# Verbose output
npm test -- --verbose

# Run a specifc test
npm test -- --testNamePattern="should calculate number stats correctly"

# Generate coverage report
npm run test:coverage
```

## Test Data

The tests use sample user responses from a burger satisfaction survey (see the [`responses` array](./analytics-mongo.test.ts)). Question include:

- `q1`: Numeric question (burgers consumed per month)
- `q2`: Date question (last purchase date)
- `q3`: Single-choice question (favorite burger type)
- `q4`: Multiple-choice question (preferred toppings)
- `q5`: Rating question (satisfaction level 1-5)
- `q6`: Ranking question (aspect importance)

This data covers various scenarios, including numeric analysis, date ranges, multiple choice selections, ratings, and rankings.

## Test Coverage

**`SurveyAnalytics` class**:

- Cache management (get/set/clear)
- Error handling (survey not found, question not found)
- Number statistics calculation
- Text response processing with NLP
- Database operations
- Redis operations

**Utility functions**:

- Median calculation (odd/even arrays, edge cases)
- Mode calculation (single/multiple modes)
- Percentile calculation (25th, 50th, 75th percentiles)
- Ranking statistics (average rankings)

**Integration scenarios**:

- End-to-end analytics flow
- Real database operations
- Cache persistence and invalidation
- NLP service integration
- Error handling with real services

## Mocking Strategy

**Unit tests**:

- MongoDB operations are mocked with Jest
- Redis client returns controlled responses
- Fetch API is mocked for NLP service calls
- All external dependencies are isolated

**Integration tests**:

- Real MongoDB and Redis connections are used
- Actual database operations are performed
- NLP service responses are mocked
- Real error scenarios are tested

## Troubleshooting

### MongoDB Connection Failed

- Ensure MongoDB is running on `localhost:27017`
- Check `MONGODB_TEST_URL` environment variable

### Redis Connection Failed

- Ensure Redis is running on `localhost:6379`
- Check `REDIS_TEST_URL` environment variable

### TypeScript Errors

- Run `npm run build` to check for compilation errors
- Ensure all dependencies are installed

### Test Timeouts

- Increase Jest timeout in `jest.config.js`
- Check for slow database operations
