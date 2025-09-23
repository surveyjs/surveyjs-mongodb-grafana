# Natural Language Processing (NLP) Service

A FastAPI-based NLP service that analyzes survey text responses and extracts insights using a variety of natural language processing techniques. This service provides NLP capabilities as part of the overall integration between SurveyJS and Grafana.

## Key Features

- **Sentiment Analysis**    
Evaluates text sentiment, returning polarity, subjectivity, and a sentiment label (positive/negative/neutral).
- **Named Entity Recognition (NER)**    
Detects and extracts named entities such as people, organizations, and locations.
- **Key Phrase Extraction**     
Identifies important noun phrases using chunking techniques.
- **RESTful API**   
Exposes clean, well-structured HTTP endpoints for text analysis.

## Technology Stack

- [FastAPI](https://fastapi.tiangolo.com/) &ndash; A modern, high-performance framework for building APIs.
- [Uvicorn](https://www.uvicorn.org/) &ndash; ASGI server for running FastAPI apps.
- [spaCy](https://spacy.io/) &ndash; Advanced NLP library for entity recognition and linguistic processing.
- [TextBlob](https://textblob.readthedocs.io/en/dev/) &ndash; Lightweight library for sentiment analysis.
- [Python 3.9](https://www.python.org/) &ndash; Runtime environment.

## How It Works

The NLP service integrates with the SurveyJS application through the Node.js backend. The `SurveyAnalytics` class in [`node-server/src/services/analytics.ts`](../node-server/src/services/analytics.ts) collects survey text responses longer than 15 characters and forwards them to the NLP service. The results are stored in MongoDB under the `nlp` field, alongside the original response data.

The service URL can be configured via the `NLP_SERVICE_URL` environment variable (default: `http://nlp-service:5000`).

## API Endpoints

- **GET** `/health`     
Returns service health status and a timestamp. Example: `{"status": "healthy", "timestamp": "2024-01-01T12:00:00"}`.
- **GET** `/sentiment?text={text}`    
Analyzes the sentiment of the text provided as a query parameter and returns [analysis results](#response-format).
- **POST** `/analyze`   
Analyzes text from the request body&mdash;`{"text": "Your text to analyze"}`&mdash;and returns [analysis results](#response-format).

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

## Setup

The service is containerized and runs as part of the Docker Compose stack:

- **Port**: 5000
- **Network**: analytics-net
- **Dependencies**: Automatically downloads spaCy English model (`en_core_web_sm`)

To run the NLP service locally, do the following:

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Start development server
uvicorn app:app --reload
```

## Usage Examples

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