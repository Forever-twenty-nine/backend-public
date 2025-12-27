import Server from "@/express/index";
import setErrorHandlers from "@/config/errors/error-handler";
import config from "@/config/index";
import registerRoutes from "@/routes/index";

// initial server

(async () => {
  const routes = await registerRoutes();
  const server = new Server(config.PORT, routes, setErrorHandlers);
  server.start();
})();
