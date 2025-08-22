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

Run containers:
```
docker compose up -d
```

Not that NLP server needs to download and build sentiment analyis model and build it. nlp-service container build can take ~5 minutes
