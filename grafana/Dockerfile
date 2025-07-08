FROM grafana/grafana:10.3.1

USER root

RUN grafana-cli plugins install grafana-mongodb-datasource
# RUN grafana-cli plugins install marcusolsson-mongodb-datasource

USER grafana

# ENV GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=marcusolsson-mongodb-datasource
