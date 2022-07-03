import 'dotenv/config';
import express, { Application } from 'express';
import router from './router';

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

try {
  app.listen(port, (): void => {
    console.log(`Express server is running on port ${port}!`);
  });
} catch (e) {
  console.log(
    `Error starting up express server on port ${port}! ${(e as Error).message}`
  );
}
