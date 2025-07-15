# Survey Analytics Testing

This directory contains comprehensive unit and integration tests for the SurveyAnalytics service.

## Test Structure

### Unit Tests
- `analytics.test.ts` - Unit tests for the SurveyAnalytics class with mocked dependencies
- `utils.test.ts` - Unit tests for utility functions (median, mode, percentile, ranking stats)

### Integration Tests
- `integration.test.ts` - End-to-end tests using real MongoDB and Redis instances

## Setup

### Prerequisites
1. Node.js (v16 or higher)
2. MongoDB instance (for integration tests)
3. Redis instance (for integration tests)

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

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm test -- --testPathPattern="(unit|analytics|utils)"
```

### Integration Tests Only
```bash
npm test -- --testPathPattern="integration"
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Data

The tests use sample survey data based on a burger satisfaction survey:

### Survey Structure
- **q1**: Number question (burgers consumed per month)
- **q2**: Date question (last purchase date)
- **q3**: Single choice question (favorite burger type)
- **q4**: Multiple choice question (preferred toppings)
- **q5**: Rating question (satisfaction level 1-5)
- **q6**: Ranking question (aspect importance ranking)

### Sample Responses
The tests include 5 sample responses with realistic data covering different scenarios:
- Various numeric values for statistical analysis
- Different date ranges
- Multiple choice selections
- Rating distributions
- Ranking preferences

## Test Coverage

### SurveyAnalytics Class
- ✅ Cache management (get/set/clear)
- ✅ Error handling (survey not found, question not found)
- ✅ Number statistics calculation
- ✅ Text response processing with NLP
- ✅ Database operations
- ✅ Redis operations

### Utility Functions
- ✅ Median calculation (odd/even arrays, edge cases)
- ✅ Mode calculation (single/multiple modes)
- ✅ Percentile calculation (25th, 50th, 75th percentiles)
- ✅ Ranking statistics (average rankings)

### Integration Scenarios
- ✅ End-to-end analytics flow
- ✅ Real database operations
- ✅ Cache persistence and invalidation
- ✅ NLP service integration
- ✅ Error handling with real services

## Mocking Strategy

### Unit Tests
- MongoDB operations are mocked using Jest mocks
- Redis client is mocked with controlled responses
- Fetch API is mocked for NLP service calls
- All external dependencies are isolated

### Integration Tests
- Real MongoDB and Redis connections
- Actual database operations
- Mocked NLP service responses
- Real error scenarios

## Best Practices

1. **Isolation**: Each test is independent and cleans up after itself
2. **Realistic Data**: Tests use realistic survey data that matches production format
3. **Edge Cases**: Tests cover error conditions and boundary cases
4. **Performance**: Integration tests use separate test databases
5. **Maintainability**: Clear test descriptions and organized structure

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running on localhost:27017
   - Check MONGODB_TEST_URL environment variable

2. **Redis Connection Failed**
   - Ensure Redis is running on localhost:6379
   - Check REDIS_TEST_URL environment variable

3. **TypeScript Errors**
   - Run `npm run build` to check for compilation errors
   - Ensure all dependencies are installed

4. **Test Timeouts**
   - Increase Jest timeout in `jest.config.js`
   - Check for slow database operations

### Debug Mode
Run tests with verbose output:
```bash
npm test -- --verbose
```

### Single Test
Run a specific test:
```bash
npm test -- --testNamePattern="should calculate number stats correctly"
``` 