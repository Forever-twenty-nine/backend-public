import Server from './express/index.js';
import setErrorHandlers from './config/errors/error-handler.js';
import config from './config/index.js';
import registerRoutes from './routes/index.js';

// initial server

(async () => {
  const routes = await registerRoutes();
  const server = new Server(config.PORT, routes, setErrorHandlers);
  server.start();
})();
