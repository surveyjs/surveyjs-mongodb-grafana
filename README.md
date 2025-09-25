# SurveyJS MongoDB Grafana Integration

A full-stack solution for building survey analytics dashboards with SurveyJS, MongoDB, and Grafana. It lets you create surveys, collect and process responses, run sentiment and text analysis using a natural language processing (NLP) service, and visualize results in interactive dashboards.

## Architecture

- SurveyJS provides survey data models.
- Node.js backend handles surveys, responses, analytics, and Grafana queries.
- NLP service performs sentiment and text analysis.
- Redis caches analytics for faster performance.
- Grafana plugin visualizes survey data in real time.

```
       Redis Cache  MongoDB
            ↓          ↓
SurveyJS → Node.js Backend → Grafana Plugin → Grafana Dashboards
                ↓
            NLP Service (text analysis)
```

## Project Structure

- [`node-server`](/node-server/) - Backend service
- [`mongo`](/mongo/) - MongoDB configuration
- [`nlp-service`](/nlp-service/) - Natural language processing service
- [`grafana`](/grafana/) - Grafana configuration
- [`provisioning`](/grafana/provisioning/) - Automatic configuration files
- [`surveyjs-grafana-datasource`](/grafana/surveyjs-grafana-datasource/) - Plugin for analytics visualization

## Quick Start

```bash
# Clone this repo
git clone https://github.com/surveyjs/surveyjs-mongodb-grafana.git

# Build SurveyJS Grafana DataSource
cd surveyjs-mongodb-grafana/grafana/surveyjs-grafana-datasource
npm i
npm run build

# Build Node.js backend
cd surveyjs-mongodb-grafana/node-server
npm i
npm run build

# Prepare NLP service
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Run Docker containers
docker compose up -d
```

> NLP model download and build may take ~5 minutes.

Access services:

 - http://localhost:3000/ - SurveyJS backend: view survey list, run a survey, display results in a table.
 - http://localhost:3001/ - Grafana dashboards (login: `admin`, password: `grafana`).

## Access Configuration

MongoDB and Grafana access is controlled by [environment variables](.env):

```
# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

## Sample Dashboard

A preconfigured Grafana dashboard ([`burger_survey.json`](./grafana/provisioning/dashboards/burger_survey.json)) demonstrates choice distributions, ratings, sentiment analysis, and temporal response trends.

## Troubleshooting

### Services Not Starting

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

### Database Connection Issues

```bash
# Check MongoDB connectivity
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis connectivity
docker-compose exec redis redis-cli ping
```

### Grafana Dashboard Issues

1. Verify data sources are configured correctly.
2. Check backend service connectivity.
3. Review Grafana logs for errors.
4. Ensure survey data exists in MongoDB.

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
# Node.js backend
NODE_ENV=development docker-compose up

# Grafana
GF_LOG_LEVEL=debug docker-compose up grafana
```

## License

Apache-2.0. See [LICENSE](./LICENSE).
