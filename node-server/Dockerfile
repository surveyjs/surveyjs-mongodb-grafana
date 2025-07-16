FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# COPY . .
# RUN npm run build

EXPOSE 3000
EXPOSE 9229
CMD ["node", "--inspect=0.0.0.0:9229", "dist/index.js"]