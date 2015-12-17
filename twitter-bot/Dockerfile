FROM node:4.2.3-wheezy
ADD . /twitter-bot
WORKDIR /twitter-bot
RUN npm install
RUN mkdir /var/somewhere
ADD ./database.json /var/somewhere
CMD ["npm", "start"]
