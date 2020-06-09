FROM node:current-alpine

# create working directory /app
WORKDIR /app

# copy all files to /app
COPY . /app

# install node packages
RUN npm install -g --silent

# build app
RUN npm run-script build

# TO-DO: Integrate testing
# test app
# RUN npm test

# start app
CMD ["npm", "start"]
