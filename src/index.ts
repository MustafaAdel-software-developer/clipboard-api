import { startServer } from "./server.js";

const port = Number(process.env.PORT ?? 3000);
await startServer(port);