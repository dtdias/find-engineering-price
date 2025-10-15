const express = require('express');
const router = require('./router/index.js');
const path = require('path');
const crypto = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');
const { pinoHttp } = require('pino-http');
const { createWriteStream } = require('fs');

const { randomUUID } = crypto;

const currentDir = path.resolve('.', 'backend');
async function start() {
  const storage = new AsyncLocalStorage();
  const application = express();
  application.disable('x-powered-by')
  application.use(pinoHttp({
    level: 'info',
    stream: createWriteStream('app_log.ndjson', { autoClose: true, flags: 'a+' }),
    name: process.env.context
  }))
  application.use(express.urlencoded({ extended: true }));
  application.use(express.json());
  application.use((request, _, next) => { storage.enterWith({ request, id: randomUUID() }); next(); })
  application.use(router);

  application.listen(process.env.BACKEND_PORT || 3001);
}


if (process.argv.includes('--start')) start().then(() => console.info('Backend started'));

module.exports = start;