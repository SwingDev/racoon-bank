FROM node:7.7.4-alpine

# Prepare environment
RUN mkdir -p /app && \
    chown -R node /app && \
    chown -R node /home/node

ENV PATH "$PATH:/app/node_modules/.bin"

COPY package.json npm-shrinkwrap.json /tmp/

RUN apk --no-cache add bash g++ git make python tini && \
    cd /tmp && \
    npm install -d && \
    npm cache clean && \
    mv /tmp/node_modules /app/ && \
    apk del g++ git make python

# Copy app
COPY entrypoint.sh /
ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]

USER node
WORKDIR /app

COPY . /app/

ENV PORT=8080
EXPOSE $PORT

ENV OLD_SPACE_SIZE="512"

CMD node --max_old_space_size=$OLD_SPACE_SIZE --gc_interval=100 --optimize_for_size cluster.js
