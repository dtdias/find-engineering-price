import express from 'express';
import router from './router/index.js';
import path from 'node:path'

import { randomUUID } from 'node:crypto'
import { AsyncLocalStorage } from 'node:async_hooks';
import { pinoHttp } from 'pino-http';
import { createWriteStream } from 'node:fs';

const currentDir = path.resolve('.', 'frontend');
async function start() {
  const storage = new AsyncLocalStorage();
  const application = express();
  application.disable('x-powered-by')
  application.use(pinoHttp({
    level: 'info',
    stream: createWriteStream('app_log.ndjson', { autoClose: true, flags: 'a+' }),
    name: process.env.context
  }))
  application.use((request, _, next) => { storage.enterWith({ request, id: randomUUID() }); next(); })
  application.use('/static', express.static(currentDir + '/static', { cacheControl: true,lastModified: true }));
  application.set('views', currentDir + '/views');
  application.set('view engine', 'ejs');
  application.use(router);

  application.listen(process.env.FRONTEND_PORT || 3000);
}

if (process.argv.includes('--start')) start().then(() => console.info('Frontend started'));

export default start;
