import 'dotenv/config';
import express, { Application } from 'express';
import { Db } from 'mongodb';
import setupMongo from '../mongodb/index';
import setupPostgres, { ConnectFunction } from '../postgresql/index';
import ChatController from './controllers/chat_controller';
import PostController from './controllers/post_controller';

const app: Application = express();
const port = process.env.PORT || 3000;
let mongo: Db | undefined;
let postgresConnector: ConnectFunction | undefined;
async function setup() {
  mongo = await setupMongo();
  postgresConnector = setupPostgres();  
  const postController: PostController = new PostController(mongo as Db);
  const chatController: ChatController = new ChatController(mongo as Db);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/posts', postController.router);
  app.use('/chats', chatController.router);
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
