# NLP Service

A FastAPI-based Natural Language Processing service that provides text analysis capabilities for the SurveyJS MongoDB Grafana integration project.

## Overview

The NLP Service is a microservice designed to analyze survey text responses and extract meaningful insights through various NLP techniques. It processes text data from survey responses and provides sentiment analysis, named entity recognition, and key phrase extraction.

## Features

- **Sentiment Analysis**: Analyzes text sentiment using TextBlob, providing polarity, subjectivity, and sentiment labels (positive/negative/neutral)
- **Named Entity Recognition (NER)**: Identifies and extracts named entities (people, organizations, locations, etc.) using spaCy
- **Key Phrase Extraction**: Extracts important noun phrases from text using spaCy's noun chunking
- **RESTful API**: Provides clean HTTP endpoints for text analysis

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns service health status and timestamp
  - Response: `{"status": "healthy", "timestamp": "2024-01-01T12:00:00"}`

### Sentiment Analysis (GET)
- **GET** `/sentiment?text={text}`
  - Analyzes sentiment of provided text via query parameter
  - Returns comprehensive NLP analysis results

### Text Analysis (POST)
- **POST** `/analyze`
  - Analyzes text provided in request body
  - Request body: `{"text": "Your text to analyze"}`
  - Returns comprehensive NLP analysis results

## Response Format

All analysis endpoints return a JSON object with the following structure:

```json
{
  "sentiment": {
    "polarity": 0.5,
    "subjectivity": 0.8,
    "label": "positive"
  },
  "entities": [
    {
      "text": "John Doe",
      "label": "PERSON",
      "start": 0,
      "end": 8
    }
  ],
  "key_phrases": ["John Doe", "survey response", "customer feedback"],
  "processed_text": "Original input text"
}
```

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **spaCy**: Advanced NLP library for named entity recognition and text processing
- **TextBlob**: Simple sentiment analysis library
- **Python 3.9**: Runtime environment
- **Uvicorn**: ASGI server for FastAPI

## Integration

The NLP Service integrates with the main SurveyJS application through the Node.js backend:

- The `SurveyAnalytics` class in `node-server/src/services/analytics.ts` calls the NLP service
- Text responses longer than 15 characters are automatically processed
- Results are stored in MongoDB with the response data under the `nlp` field
- Service URL is configurable via `NLP_SERVICE_URL` environment variable (defaults to `http://nlp-service:5000`)

## Docker Deployment

The service is containerized and runs as part of the Docker Compose stack:

- **Port**: 5000
- **Network**: analytics-net
- **Dependencies**: Automatically downloads spaCy English model (`en_core_web_sm`)

## Development

### Local Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run development server
uvicorn app:app --reload
```

### Dependencies
- fastapi
- uvicorn
- textblob
- spacy

## Usage Example

```bash
# Health check
curl http://localhost:5000/health

# Analyze text via GET
curl "http://localhost:5000/sentiment?text=I love this product!"

# Analyze text via POST
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "The customer service was excellent and very helpful."}'
```