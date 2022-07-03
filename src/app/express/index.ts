import 'dotenv/config';
import express, { Application } from 'express';
import { Db } from 'mongodb';
import setupMongo from '../mongodb/index';
import PostController from './controllers/post_controller';

const app: Application = express();
const port = process.env.PORT || 3000;
let db: Db | undefined;
async function setup() {
  db = await setupMongo();
  const postController: PostController = new PostController(db as Db);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/post', postController.router);
}

async function init() {
  try {
    await setup();
    app.listen(port, (): void => {
      console.log(`Express server is running on port ${port}!`);
    });
  } catch (e) {
    console.log(
      `Error starting up express server on port ${port}! ${
        (e as Error).message
      }`
    );
  }
}

init();
