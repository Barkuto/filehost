FROM node:12

WORKDIR /data

COPY . .

RUN npm install

VOLUME /data

CMD npm start