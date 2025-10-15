FROM node:20.11-alpine as base
WORKDIR /srv/
COPY frontend/ /srv/frontend
COPY index.js /srv/index.js
COPY package.json /srv/package.json 
COPY package-lock.json /src/package-lock.json 
COPY backend/ /srv/backend
COPY model/ /srv/model
COPY admin/ /srv/admin
ONBUILD RUN npm install

FROM base
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002