# SurveyJS MongoDB Grafana Integration

A comprehensive full-stack solution that combines SurveyJS survey creation, MongoDB data storage, advanced analytics processing, and Grafana visualization to create powerful survey analytics dashboards.

## 🎯 Project Overview

This project provides a complete survey analytics platform that enables users to:
- Create and manage surveys using SurveyJS
- Collect and store survey responses in MongoDB
- Process responses with advanced analytics and NLP
- Visualize data through interactive Grafana dashboards
- Scale from development to production environments

## 🏗️ Architecture

The system consists of four main components working together:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SurveyJS      │    │   Node.js       │    │   Grafana       │
│   Frontend      │───▶│   Backend       │───▶│   Dashboards    │
│   (External)    │    │   (Port 3000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   NLP Service   │
                       │   (Port 5000)   │
                       └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │◀───│   Redis Cache   │    │   Grafana       │
│   (Port 27017)  │    │   (Port 6379)   │    │   Plugin        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
surveyjs-mongo-grafana/
├── 📁 nlp-service/                    # Natural Language Processing Service
│   ├── app.py                         # FastAPI application
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Container configuration
│   └── readme.md                      # Service documentation
│
├── 📁 node-server/                    # Core Backend Service
│   ├── 📁 src/                        # TypeScript source code
│   │   ├── 📁 db-adapters/            # Database adapters
│   │   ├── 📁 routes/                 # API route handlers
│   │   ├── 📁 services/               # Analytics services
│   │   ├── db.ts                      # Database connections
│   │   └── index.ts                   # Main server file
│   ├── 📁 tests/                      # Test suites
│   ├── package.json                   # Node.js dependencies
│   ├── Dockerfile                     # Container configuration
│   └── README.md                      # Service documentation
│
├── 📁 grafana/                        # Grafana Configuration
│   ├── 📁 provisioning/               # Auto-configuration
│   │   ├── 📁 datasources/            # Data source configs
│   │   ├── 📁 dashboards/             # Dashboard configs
│   │   └── README.md                  # Provisioning docs
│   ├── 📁 surveyjs-grafana-datasource/ # Custom Grafana Plugin
│   │   ├── 📁 src/                    # Plugin source code
│   │   ├── package.json               # Plugin dependencies
│   │   └── README.md                  # Plugin documentation
│   ├── 📁 data/                       # Grafana data persistence
│   └── Dockerfile                     # Grafana container config
│
├── 📁 mongo/                          # MongoDB Configuration
│   ├── init.js                        # Database initialization
│   └── 📁 data/                       # Database persistence
│
├── docker-compose.yaml                # Multi-service orchestration
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- Basic understanding of surveys and analytics

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd surveyjs-mongo-grafana

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```env
# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

### 3. Start the Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Applications

- **Grafana Dashboards**: http://localhost:3001
  - Username: `admin` (or your configured user)
  - Password: (your configured password)
- **Node.js API**: http://localhost:3000
- **NLP Service**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🔧 Component Details

### 1. Node.js Backend Service (`node-server/`)

**Purpose**: Core backend service handling survey management, data collection, and analytics.

**Key Features**:
- Survey CRUD operations
- Response collection and storage
- Advanced analytics processing
- Grafana datasource API
- NLP integration
- Redis caching

**Technology Stack**:
- Node.js with TypeScript
- Express.js web framework
- MongoDB for data persistence
- Redis for caching
- SurveyJS Core for survey processing

**API Endpoints**:
- `/api/*` - Survey management and analytics
- `/grafana/*` - Grafana datasource integration
- Health checks and monitoring

### 2. NLP Service (`nlp-service/`)

**Purpose**: Natural Language Processing microservice for text analysis.

**Key Features**:
- Sentiment analysis using TextBlob
- Named Entity Recognition with spaCy
- Key phrase extraction
- RESTful API for text processing

**Technology Stack**:
- Python 3.9
- FastAPI web framework
- spaCy for NLP processing
- TextBlob for sentiment analysis
- Uvicorn ASGI server

**API Endpoints**:
- `GET /health` - Service health check
- `GET /sentiment?text={text}` - Sentiment analysis
- `POST /analyze` - Comprehensive text analysis

### 3. Grafana Data Source Plugin (`grafana/surveyjs-grafana-datasource/`)

**Purpose**: Custom Grafana plugin for SurveyJS data visualization.

**Key Features**:
- Dynamic survey and question selection
- Multiple visualization types
- Real-time data updates
- Advanced query capabilities
- Sentiment analysis integration

**Technology Stack**:
- React with TypeScript
- Grafana SDK
- Custom data frame generation
- RESTful backend communication

**Visualization Types**:
- Bar charts for choice questions
- Statistical tables for numeric data
- Histograms for distributions
- Time series for temporal data
- Sentiment analysis displays

### 4. Grafana Provisioning (`grafana/provisioning/`)

**Purpose**: Automated configuration of Grafana data sources and dashboards.

**Key Features**:
- Auto-configured data sources
- Pre-built sample dashboards
- Infrastructure-as-code deployment
- Real-time configuration updates

**Configuration Files**:
- `datasources/datasources.yaml` - Data source configuration
- `dashboards/dashboards.yaml` - Dashboard provider settings
- `dashboards/burger_survey.json` - Sample dashboard

## 🔄 How Components Work Together

### Data Flow

1. **Survey Creation**: Users create surveys using SurveyJS Creator (external)
2. **Response Collection**: Survey responses are submitted to the Node.js backend
3. **Data Storage**: Responses are stored in MongoDB with metadata
4. **Analytics Processing**: Backend processes responses and calculates statistics
5. **NLP Processing**: Text responses are sent to NLP service for analysis
6. **Caching**: Results are cached in Redis for performance
7. **Visualization**: Grafana queries backend and displays data in dashboards

### Service Communication

```
SurveyJS Frontend → Node.js Backend → MongoDB
                        ↓
                   NLP Service ← Text Responses
                        ↓
                   Redis Cache ← Analytics Results
                        ↓
                   Grafana Plugin → Dashboard Visualization
```

### Integration Points

- **Node.js ↔ MongoDB**: Survey and response data storage
- **Node.js ↔ Redis**: Analytics caching and performance
- **Node.js ↔ NLP Service**: Text analysis for sentiment and entities
- **Grafana ↔ Node.js**: Data querying and visualization
- **Docker Compose**: Service orchestration and networking

## 🧪 Testing and Validation

### 1. Health Checks

```bash
# Check all services
curl http://localhost:3000/api/health    # Node.js backend
curl http://localhost:5000/health        # NLP service
curl http://localhost:3001/api/health    # Grafana
```

### 2. Create Test Survey

```bash
# Create a new survey
curl "http://localhost:3000/api/create?name=Test%20Survey"

# Submit a test response
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d '{"postId": "your_survey_id", "surveyResult": {"q1": "Test response"}}'
```

### 3. Test NLP Processing

```bash
# Test sentiment analysis
curl "http://localhost:5000/sentiment?text=I love this product!"

# Test comprehensive analysis
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "The customer service was excellent and very helpful."}'
```

### 4. Verify Grafana Integration

1. Open http://localhost:3001
2. Login with your credentials
3. Navigate to "Dashboards"
4. Open "Burger Survey Analytics" (sample dashboard)
5. Verify data is loading correctly

## 📊 Sample Dashboard

The project includes a comprehensive sample dashboard (`burger_survey.json`) demonstrating:

- **Total Responses**: Stat panel showing response count
- **Average Satisfaction**: Bar gauge with color coding
- **Choice Distributions**: Bar charts for multiple choice questions
- **Ranking Analysis**: Bar charts for ranking questions
- **Rating Distribution**: Histogram for rating data
- **Temporal Analysis**: Monthly distribution charts

## 🔧 Development and Customization

### Adding New Surveys

1. **Create Survey**: Use SurveyJS Creator to design your survey
2. **Store Configuration**: Save survey JSON to the backend
3. **Create Dashboard**: Export dashboard from Grafana or create new one
4. **Add to Provisioning**: Place dashboard JSON in `grafana/provisioning/dashboards/`

### Extending Analytics

1. **Add Question Types**: Extend analytics services for new question types
2. **Custom Calculations**: Add new statistical functions
3. **NLP Enhancements**: Extend NLP service with additional analysis
4. **Visualization Types**: Create new Grafana panel types

### Scaling the System

1. **Database Scaling**: Configure MongoDB replica sets
2. **Caching**: Implement Redis clustering
3. **Load Balancing**: Add multiple Node.js instances
4. **Monitoring**: Integrate with monitoring solutions

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
MONGO_ROOT_USER=production_admin
MONGO_ROOT_PASSWORD=secure_production_password
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure_grafana_password
```

### Security Considerations

1. **Database Security**: Use strong passwords and network isolation
2. **API Security**: Implement authentication and rate limiting
3. **Container Security**: Use non-root users and security scanning
4. **Network Security**: Configure firewalls and SSL/TLS

### Performance Optimization

1. **Database Indexing**: Add appropriate MongoDB indexes
2. **Caching Strategy**: Optimize Redis caching policies
3. **Resource Limits**: Configure container resource limits
4. **Monitoring**: Implement comprehensive monitoring

## 🔍 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

#### Database Connection Issues
```bash
# Check MongoDB connectivity
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis connectivity
docker-compose exec redis redis-cli ping
```

#### Grafana Dashboard Issues
1. Verify data sources are configured correctly
2. Check backend service connectivity
3. Review Grafana logs for errors
4. Ensure survey data exists in MongoDB

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
# Node.js backend
NODE_ENV=development docker-compose up

# Grafana
GF_LOG_LEVEL=debug docker-compose up grafana
```

## 📈 Future Enhancements

### Planned Features

1. **Advanced Analytics**:
   - Machine learning integration
   - Predictive analytics
   - Advanced statistical models
   - Custom calculation engines

2. **Enhanced Visualizations**:
   - Interactive charts
   - Real-time dashboards
   - Custom visualization types
   - Mobile-responsive designs

3. **Integration Capabilities**:
   - Webhook support
   - API integrations
   - Third-party service connections
   - Export capabilities

4. **User Experience**:
   - User authentication
   - Role-based access control
   - Custom dashboard creation
   - Survey templates

### Contributing

1. **Fork the Repository**: Create your own fork
2. **Create Feature Branch**: `git checkout -b feature/new-feature`
3. **Make Changes**: Implement your enhancements
4. **Add Tests**: Include comprehensive tests
5. **Submit Pull Request**: Create PR with detailed description

### Development Guidelines

- Follow TypeScript best practices
- Add comprehensive documentation
- Include unit and integration tests
- Use consistent code formatting
- Follow semantic versioning

## 📚 Documentation

### Component Documentation

- [NLP Service Documentation](nlp-service/readme.md)
- [Node.js Backend Documentation](node-server/README.md)
- [Grafana Plugin Documentation](grafana/surveyjs-grafana-datasource/README.md)
- [Grafana Provisioning Documentation](grafana/provisioning/README.md)

### External Resources

- [SurveyJS Documentation](https://surveyjs.io/Documentation/Library)
- [Grafana Documentation](https://grafana.com/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📄 License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.

## 🤝 Support

For support, questions, or contributions:

1. **Issues**: Create GitHub issues for bugs or feature requests
2. **Discussions**: Use GitHub discussions for questions
3. **Documentation**: Check component-specific documentation
4. **Community**: Join the SurveyJS community forums

## 🎉 Getting Started Checklist

- [ ] Clone the repository
- [ ] Configure environment variables
- [ ] Execute `npm i` command in `node-server` folder
- [ ] Build `node_server` project using `npm run build` command
- [ ] Install dependencies in `nlp-service` folder using the `pip install -r requirements.txt` command
- [ ] Download spaCy model in `nlp-service` folder using the `python -m spacy download en_core_web_sm` command
- [ ] Execute `npm i` command in `grafana/surveyjs-grafana-datasource` folder
- [ ] Build `surveyjs-grafana-datasource` project using `npm run build` command
- [ ] Start services with `docker-compose up -d`
- [ ] Verify all services are running
- [ ] Access Grafana at http://localhost:3001
- [ ] Explore the sample dashboard
- [ ] Create your first survey
- [ ] Submit test responses
- [ ] View analytics in Grafana
- [ ] Customize dashboards for your needs

## How to run this example

Clone this repo:
```
git clone https://github.com/tsv2013/surveyjs-mongo-grafana.git
```

Build SurveyJS Grafana datasource:
```
cd surveyjs-mongo-grafana/grafana/surveyjs-grafana-datasource
npm i
npm run build
```

Build NodeJS backend:
```
cd surveyjs-mongo-grafana/node-server
npm i
npm run build
```

Prepare NLP service:
```
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Run containers:
```
docker compose up -d
```

Note that NLP server needs to download sentiment analyis model and build it that can take ~5 minutes.

Two sites are available after docker starts:
 - http://localhost:3000/ - simple surveyjs backend: surveys list, run survey, display results in table form
 - http://localhost:3001/ - grafana dashboard server site: login/password - admin/grafana

**Happy Surveying and Analytics!** 📊✨


