import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import ChatDataAdapter from '../../adapters/chat_data_adapter';
import ChatUsecases from '../../../domain/usecases/chat';
import {
  ICreateChat,
  ISendMessage,
} from '../../../domain/usecases/interface.chat';

export default class ChatController {
  private readonly _router: Router;
  private chatUsecases: ChatUsecases;

  constructor(db: Db) {
    this._router = Router();
    this.chatUsecases = new ChatUsecases(new ChatDataAdapter(db));
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async createChat(req: Request, resp: Response) {
    const input: ICreateChat = req.body as ICreateChat;

    const id = await this.chatUsecases.createChat(input);
    if (id != null) resp.status(201).json(id);
    else resp.sendStatus(400);
  }

  private async sendMessage(req: Request, resp: Response) {
    const chatId = req.params.id;
    const input: ISendMessage = req.body as ISendMessage;

    if (await this.chatUsecases.sendMessage(chatId, input))
      resp.sendStatus(201);
    else resp.sendStatus(400);
  }

  private async getChatById(req: Request, resp: Response) {
    const chatID = req.params.id;
    const chat = await this.chatUsecases.getChatById(chatID);

    if (chat) resp.status(200).json(chat);
    else resp.sendStatus(400);
  }

  private mapRoutes() {
    this._router.post('/', this.createChat.bind(this));
    this._router.get('/:id', this.getChatById.bind(this));
    this._router.post('/:id', this.sendMessage.bind(this));
  }
}
