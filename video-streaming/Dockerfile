FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY ./src ./src
COPY ./videos ./videos

EXPOSE 3000

CMD npm start