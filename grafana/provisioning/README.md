# SurveyJS MongoDB Grafana Provisioning

This directory contains configuration files for provisioning Grafana dashboards and data sources for the SurveyJS MongoDB integration.

## Files

- **Dashboard JSONs**: Defines the layout and panels for displaying survey analytics.
- **Data Source YAML**: Configures the connection between Grafana and MongoDB.

## Usage

Place the provisioning files in the appropriate directory within your Grafana instance. Upon startup, Grafana will automatically detect and apply these configurations.

## Customization

Modify the JSON and YAML files to tailor the dashboards and data sources to your specific requirements, such as adjusting queries or panel settings.