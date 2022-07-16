import 'dotenv/config';
import 'reflect-metadata';
import * as swaggerDoc from '../swagger/api.json';
import swaggerUI from 'swagger-ui-express';
import express, { Application } from 'express';
import setupPostgres from '../postgresql/index';
import setupMongo from '../mongodb/index';
import setupNeo4j from '../neo4j/index';
import setupRedis from '../redis/index';
import ProfileController from './controllers/profile_controller';
import AccountController from './controllers/account_controller';
import ChatController from './controllers/chat_controller';
import PostController from './controllers/post_controller';
import Neo4jRepository from '../neo4j/neo4j_repository';
import RedisRepository from '../redis/redis_repository';
import { DataSource } from 'typeorm';
import { Db } from 'mongodb';
import { exit } from 'process';
import ChatGroupController from './controllers/chat_group_controller';

const app: Application = express();
const port = process.env.PORT || 3000;
let mongo: Db | undefined;
let postgres: DataSource | undefined;
let neo4j: Neo4jRepository | undefined;
let redis: RedisRepository | undefined;
async function setup() {
  mongo = await setupMongo();
  postgres = await setupPostgres();
  neo4j = await setupNeo4j();
  redis = await setupRedis();
  const postController: PostController = new PostController(mongo, neo4j);
  const chatController: ChatController = new ChatController(mongo);
  const groupChatController: ChatGroupController = new ChatGroupController(
    mongo
  );
  const profileController: ProfileController = new ProfileController(postgres);
  const accountController: AccountController = new AccountController(
    postgres,
    neo4j,
    redis
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  app.use('/profiles', profileController.router);
  app.use('/accounts', accountController.router);
  app.use('/posts', postController.router);
  app.use('/chats', chatController.router);
  app.use('/groups', groupChatController.router);
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
    exit(1);
  }
}

init();
