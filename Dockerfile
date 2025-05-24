FROM node:22-alpine

WORKDIR /app

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./

RUN { \
      npm install || \
      sleep 5 && \
      npm cache clean --force && \
      npm install; \
    }

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]