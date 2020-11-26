FROM node:12.18.1

ENV NODE_ENV=production

# I think this is the work directory in the container?
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# psql
RUN apt-get update && apt-get install -y postgresql

# Turn on when this file needs to be self contained
#RUN npm install ts-node

# Turn on when this file needs to be self contained
#RUN npm install --production

COPY . .

CMD ["npm", "run", "start"]

