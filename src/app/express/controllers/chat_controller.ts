import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import ChatDataAdapter from '../../adapters/chat_data_adapter';
import ChatUsecases from '../../../domain/usecases/chat';
import {
  ICreateChat,
  ISendMessage,
} from '../../../domain/usecases/interfaces/interface.chat';

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
    const session: string = req.body.sessionId;
    delete req.body.sessionId;
    const input: ICreateChat = req.body as ICreateChat;

    const usecaseResp = await this.chatUsecases.createChat(session, input);
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async sendMessage(req: Request, resp: Response) {
    const chatId = req.params.id;
    const session: string = req.body.sessionId;
    delete req.body.sessionId;
    const input: ISendMessage = req.body as ISendMessage;

    const usecaseResp = await this.chatUsecases.sendMessage(
      session,
      chatId,
      input
    );

    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async getChatById(req: Request, resp: Response) {
    const chatID = req.params.id;
    const session: string = req.params.session;
    const usecaseResp = await this.chatUsecases.getChatById(session, chatID);

    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private mapRoutes() {
    this._router.post('/', this.createChat.bind(this));
    this._router.get('/:id/:session', this.getChatById.bind(this));
    this._router.post('/:id', this.sendMessage.bind(this));
  }
}
