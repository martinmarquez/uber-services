import { createApiServer } from "./server.js";

const port = Number(process.env.PORT ?? 5178);
const host = process.env.HOST ?? "127.0.0.1";
const sqliteDbPath = process.env.SQLITE_PATH ?? "server/.data/reviews-dev.sqlite";

const server = createApiServer({ sqliteDbPath });

server.listen(port, host, () => {
  process.stdout.write(
    `api_server_listening http://${host}:${port} sqlite=${sqliteDbPath}\n`
  );
});
