FROM node:20.11.0

WORKDIR /usr/src/app

COPY . . 

RUN npm install

EXPOSE 8000

CMD ["npm", "start"]