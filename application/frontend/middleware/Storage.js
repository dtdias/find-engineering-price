import sqliteStorage1 from 'cache-manager-sqlite';
import sqliteStorage2 from 'cache-manager-sqlite';

import cacheManager from 'cache-manager';

const storage = await cacheManager.caching('memory', {
  store: sqliteStorage1,
  options: {
    serialize: 'json',
    ttl: 60 * 60 * 24 * 7,
  }
});

const inviteStorage = await cacheManager.caching('memory', {
  storage: sqliteStorage2,
  options: {
    serialize: 'json',
    ttl: 60 * 60 * 24 * 7,
  }
});

const storageMiddleware = async (req, _, next) => {
  req.storage = {
    budget: storage,
    invite: inviteStorage
  };
  next();
}

export default storageMiddleware;
