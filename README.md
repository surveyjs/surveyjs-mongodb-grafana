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

Two sites are available after docker starts:
http://localhost:3000/ - simple surveyjs backend: surveys list, run survey, display results in table form
http://localhost:3001/ - grafana dashboard server site: login/password - admin/grafana
