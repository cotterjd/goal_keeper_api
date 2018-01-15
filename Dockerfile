FROM node:alpine
COPY . /var/www/scolasticus_api
WORKDIR /var/www/scolasticus_api
RUN npm install pm2 -g
RUN npm install
EXPOSE 4050
CMD ["pm2-docker", "index.js"]