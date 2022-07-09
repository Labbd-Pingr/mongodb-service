import 'dotenv/config';
import 'reflect-metadata';
import express, { Application } from 'express';
import { Db } from 'mongodb';
import setupMongo from '../mongodb/index';
import setupPostgres from '../postgresql/index';
import ProfileController from './controllers/profile_controller';
import ChatController from './controllers/chat_controller';
import PostController from './controllers/post_controller';
import { DataSource } from 'typeorm';

const app: Application = express();
const port = process.env.PORT || 3000;
let mongo: Db | undefined;
let postgres: DataSource | undefined;
async function setup() {
  mongo = await setupMongo();
  postgres = await setupPostgres();
  const postController: PostController = new PostController(mongo);
  const chatController: ChatController = new ChatController(mongo);
  const profileController: ProfileController = new ProfileController(postgres);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/posts', postController.router);
  app.use('/chats', chatController.router);
  app.use('/profiles', profileController.router);
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
