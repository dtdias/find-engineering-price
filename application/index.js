
import cluster from 'node:cluster';

const { FRONTEND_PORT, BACKEND_PORT } = process.env
const workerContexts = ['frontend', 'backend'];
if (cluster.isPrimary) {
  for (const context of workerContexts) {
    const env = {
      context,
      FRONTEND_PORT: FRONTEND_PORT ?? 3000,
      BACKEND_PORT: BACKEND_PORT ?? 3001,
      API_URL: process.env.API_URL
    }
    cluster.fork(env)
  }
} else {
  const { worker } = cluster;
  const context = workerContexts[worker.id - 1];
  const service = await import(context);
  await service.default();
}