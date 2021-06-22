FROM node:14
WORKDIR '/var/www/app'

COPY . .

RUN yarn install
EXPOSE 3000