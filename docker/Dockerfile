FROM node:20.14.0-alpine3.20
RUN apk add --no-cache bash

WORKDIR /app
COPY ./start-container /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container
ENTRYPOINT ["start-container"]
