# Grafana Provisioning Configuration

This directory contains Grafana provisioning configuration files that automatically configure data sources and dashboards when Grafana starts. These files enable infrastructure-as-code deployment of Grafana with pre-configured SurveyJS analytics dashboards.

## Directory Structure

```
grafana/provisioning/
├── datasources/
│   └── datasources.yaml          # Data source configuration
├── dashboards/
│   ├── dashboards.yaml           # Dashboard provider configuration
│   └── burger_survey.json        # Sample burger survey dashboard
└── README.md                     # This documentation file
```

## Configuration Files

### Data Sources (`datasources/datasources.yaml`)

The data sources configuration file automatically provisions data sources when Grafana starts, eliminating the need for manual configuration.

#### Configuration Details

```yaml
apiVersion: 1

datasources:
  - name: SurveyAPI
    type: grafana-simple-json-datasource
    access: proxy
    url: http://node-server:3000/grafana
    isDefault: true
    editable: true

  - name: SurveyJS
    type: surveyjs-grafana-datasource
    access: proxy
    basicAuth: false
    editable: true
    enabled: true
    url: http://node-server:3000/grafana
    jsonData:
      url: http://node-server:3000/grafana
      path: ""
    secureJsonData:
      apiKey: "your_api_key_here"
```

#### Data Source Descriptions

##### SurveyAPI (Simple JSON Data Source)
- **Type**: `grafana-simple-json-datasource`
- **Purpose**: Fallback data source using Grafana's built-in Simple JSON datasource
- **URL**: `http://node-server:3000/grafana`
- **Access**: Proxy mode for server-side requests
- **Default**: Set as default data source
- **Editable**: Allows modifications through Grafana UI

##### SurveyJS (Custom Data Source)
- **Type**: `surveyjs-grafana-datasource`
- **Purpose**: Primary data source using the custom SurveyJS Grafana plugin
- **URL**: `http://node-server:3000/grafana`
- **Access**: Proxy mode for server-side requests
- **Authentication**: API key-based authentication
- **Configuration**:
  - `jsonData.url`: Backend service endpoint
  - `jsonData.path`: Optional additional API path
  - `secureJsonData.apiKey`: Secure API key for authentication

#### Configuration Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `name` | Display name for the data source | Yes |
| `type` | Data source type identifier | Yes |
| `access` | Access mode (proxy/direct) | Yes |
| `url` | Backend service URL | Yes |
| `isDefault` | Set as default data source | No |
| `editable` | Allow UI modifications | No |
| `basicAuth` | Enable basic authentication | No |
| `enabled` | Enable/disable data source | No |
| `jsonData` | Additional configuration data | No |
| `secureJsonData` | Secure configuration data | No |

### Dashboard Provider (`dashboards/dashboards.yaml`)

The dashboard provider configuration defines how Grafana discovers and loads dashboard files.

#### Configuration Details

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    folderUid: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
      foldersFromFilesStructure: true
```

#### Provider Configuration Parameters

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `name` | Unique provider name | - | Yes |
| `orgId` | Organization ID | 1 | No |
| `folder` | Dashboard folder name | '' | No |
| `folderUid` | Folder UID (auto-generated if empty) | '' | No |
| `type` | Provider type | 'file' | No |
| `disableDeletion` | Prevent dashboard deletion | false | No |
| `updateIntervalSeconds` | Scan interval for changes | 10 | No |
| `allowUiUpdates` | Allow UI modifications | true | No |
| `options.path` | Path to dashboard files | - | Yes |
| `options.foldersFromFilesStructure` | Create folders from filesystem | true | No |

#### Key Features

- **File-based Discovery**: Automatically discovers JSON dashboard files
- **Real-time Updates**: Scans for changes every 10 seconds
- **UI Modifications**: Allows dashboard editing through Grafana UI
- **Folder Structure**: Creates folders based on filesystem structure
- **Auto-deployment**: Automatically loads dashboards on Grafana startup

### Sample Dashboard (`dashboards/burger_survey.json`)

A comprehensive example dashboard demonstrating SurveyJS data visualization capabilities.

#### Dashboard Overview

**Title**: "Burger Survey Analytics"
**Purpose**: Demonstrates various visualization types for survey data analysis

#### Panel Types and Configurations

##### 1. Total Responses (Stat Panel)
```json
{
  "title": "Total Responses",
  "type": "stat",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "refId": "A"
  }]
}
```
- **Visualization**: Single statistic display
- **Data**: Total response count for the survey
- **Position**: Top-left corner (4x3 grid)

##### 2. Average Satisfaction Rating (Bar Gauge)
```json
{
  "title": "Average Satisfaction Rating",
  "type": "bargauge",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "questionId": "q5",
    "refId": "A"
  }]
}
```
- **Visualization**: Horizontal bar gauge with color coding
- **Data**: Average rating from question q5
- **Configuration**: 
  - Min: 0, Max: 5
  - Color thresholds: Purple (0-2), Green (2-5)
  - Gradient display mode

##### 3. Favorite Burger Distribution (Bar Chart)
```json
{
  "title": "Favorite Burger Distribution",
  "type": "barchart",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "questionId": "q3",
    "refId": "A"
  }]
}
```
- **Visualization**: Bar chart showing choice distribution
- **Data**: Multiple choice responses from question q3
- **Transformations**: Converts Count field to number type

##### 4. Aspect Ranking Importance (Bar Chart)
```json
{
  "title": "Aspect Ranking Importance",
  "type": "barchart",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "questionId": "q6",
    "refId": "A"
  }]
}
```
- **Visualization**: Bar chart for ranking data
- **Data**: Ranking question responses from question q6
- **Purpose**: Shows average rankings for different aspects

##### 5. Toppings Preference (Bar Chart)
```json
{
  "title": "Toppings Preference",
  "type": "barchart",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "questionId": "q4",
    "refId": "A"
  }]
}
```
- **Visualization**: Bar chart for multiple choice data
- **Data**: Multiple choice responses from question q4
- **Transformations**: Converts Count field to number type

##### 6. Satisfaction Rating Distribution (Histogram)
```json
{
  "title": "Satisfaction Rating Distribution",
  "type": "histogram",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "questionId": "q5",
    "queryText": "values",
    "refId": "A"
  }]
}
```
- **Visualization**: Histogram showing rating distribution
- **Data**: Individual rating values from question q5
- **Query**: Uses "values" queryText to get raw data

##### 7. Burgers Per Month Distribution (Bar Chart)
```json
{
  "title": "Burgers Per Month Distribution",
  "type": "barchart",
  "targets": [{
    "surveyId": "burger_survey_2023",
    "questionId": "q2",
    "queryText": "2023",
    "refId": "A"
  }]
}
```
- **Visualization**: Bar chart for temporal data
- **Data**: Date-based responses from question q2
- **Query**: Uses "2023" queryText for year-specific analysis

#### Dashboard Layout

The dashboard uses a responsive grid layout with panels positioned as follows:

```
┌─────────────┬─────────────────────────────────┐
│ Total       │ Average Satisfaction Rating     │
│ Responses   │ (Bar Gauge)                     │
│ (4x3)       │ (13x3)                         │
├─────────────┼─────────────────────────────────┤
│ Favorite Burger Distribution (9x8)            │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ Aspect Ranking Importance (8x8)              │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ Toppings Preference (12x10)                  │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ Satisfaction Rating Distribution (5x10)      │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ Burgers Per Month Distribution (17x11)       │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

## Deployment and Usage

### Docker Compose Integration

The provisioning configuration is automatically mounted into the Grafana container:

```yaml
grafana:
  image: grafana/grafana:latest
  volumes:
    - ./grafana/provisioning:/etc/grafana/provisioning
    - ./grafana/data:/var/lib/grafana
  ports:
    - "3001:3000"
```

### Configuration Loading

1. **Startup Process**: Grafana automatically loads provisioning files on startup
2. **Data Sources**: Two data sources are created automatically
3. **Dashboards**: Sample dashboard is loaded and available immediately
4. **Updates**: Configuration changes require Grafana restart

### Customization

#### Adding New Data Sources

To add additional data sources, modify `datasources/datasources.yaml`:

```yaml
datasources:
  - name: "New Data Source"
    type: "your-datasource-type"
    access: proxy
    url: "http://your-service:port"
    editable: true
```

#### Adding New Dashboards

1. **Create Dashboard**: Export dashboard JSON from Grafana UI
2. **Save File**: Place JSON file in `dashboards/` directory
3. **Restart Grafana**: Configuration will be loaded automatically

#### Modifying Existing Dashboards

1. **Edit JSON**: Modify dashboard JSON files directly
2. **Auto-reload**: Changes detected within 10 seconds
3. **UI Updates**: Can be modified through Grafana UI if `allowUiUpdates: true`

## Best Practices

### Security Considerations

1. **API Keys**: Store sensitive data in `secureJsonData` section
2. **Network Access**: Use proxy mode for internal services
3. **Authentication**: Configure appropriate authentication methods

### Performance Optimization

1. **Update Intervals**: Adjust `updateIntervalSeconds` based on needs
2. **Dashboard Size**: Keep dashboards focused and efficient
3. **Data Source Limits**: Configure appropriate query timeouts

### Maintenance

1. **Version Control**: Keep provisioning files in version control
2. **Backup**: Regularly backup dashboard configurations
3. **Documentation**: Document custom configurations and changes

## Troubleshooting

### Common Issues

#### Data Sources Not Loading
- Verify backend service is running
- Check URL configuration
- Ensure network connectivity

#### Dashboards Not Appearing
- Check file permissions
- Verify JSON syntax
- Review Grafana logs

#### Configuration Changes Not Applied
- Restart Grafana service
- Check file paths
- Verify YAML syntax

### Debug Mode

Enable debug logging in Grafana configuration:

```ini
[log]
level = debug
```

### Log Locations

- **Grafana Logs**: `/var/log/grafana/grafana.log`
- **Container Logs**: `docker logs grafana-container`

## Integration with SurveyJS Ecosystem

### Backend Services

The provisioning configuration connects to:
- **Node.js Server**: Primary data source at `http://node-server:3000/grafana`
- **SurveyJS Plugin**: Custom datasource plugin for survey data
- **MongoDB**: Survey and response data storage
- **Redis**: Caching layer for performance

### Data Flow

1. **Configuration Loading**: Provisioning files loaded on Grafana startup
2. **Data Source Creation**: SurveyJS datasource configured automatically
3. **Dashboard Loading**: Sample dashboard loaded and ready
4. **Data Querying**: Dashboards query SurveyJS backend for analytics
5. **Visualization**: Data displayed in various chart types

## Examples and Templates

### Creating Custom Dashboards

Use the burger survey dashboard as a template:

1. **Copy Structure**: Use existing panel configurations
2. **Modify Queries**: Update surveyId and questionId
3. **Adjust Layout**: Modify gridPos for different layouts
4. **Customize Visualizations**: Change panel types and options

### Query Examples

#### Basic Survey Query
```json
{
  "surveyId": "your_survey_id",
  "refId": "A"
}
```

#### Question-Specific Query
```json
{
  "surveyId": "your_survey_id",
  "questionId": "your_question_id",
  "refId": "A"
}
```

#### Advanced Query with Parameters
```json
{
  "surveyId": "your_survey_id",
  "questionId": "your_question_id",
  "queryText": "additional_parameters",
  "refId": "A"
}
```

## Support and Resources

### Documentation
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Data Source Configuration](https://grafana.com/docs/grafana/latest/administration/provisioning/#datasources)
- [Dashboard Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards)

### Community
- [Grafana Community Forum](https://community.grafana.com/)
- [SurveyJS Documentation](https://surveyjs.io/Documentation/Library)

### Issues and Contributions
For issues or contributions related to this provisioning configuration, please refer to the main project repository.
