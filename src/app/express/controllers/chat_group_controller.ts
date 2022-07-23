import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import ChatGroupUsecases from '../../../domain/usecases/chat_group';
import { ISendMessage } from '../../../domain/usecases/interfaces/interface.chat';
import ChatGroupDataAdapter from '../../adapters/chat_group_data_adapter';
import {
  IAddUser,
  ICreateGroupChat,
} from '../../../domain/usecases/interfaces/interface.group_chat';

export default class ChatGroupController {
  private readonly _router: Router;
  private chatGroupUsecases: ChatGroupUsecases;

  constructor(db: Db) {
    this._router = Router();
    this.chatGroupUsecases = new ChatGroupUsecases(
      new ChatGroupDataAdapter(db)
    );
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async createChat(req: Request, resp: Response) {
    const session: string = req.body.sessionId;
    delete req.body.sessionId;
    const input: ICreateGroupChat = req.body as ICreateGroupChat;

    const usecaseResp = await this.chatGroupUsecases.createChat(session, input);
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async sendMessage(req: Request, resp: Response) {
    const session: string = req.body.sessionId;
    delete req.body.sessionId;
    const chatId = req.params.id;
    const input: ISendMessage = req.body as ISendMessage;

    const usecaseResp = await this.chatGroupUsecases.sendMessage(
      session,
      chatId,
      input
    );
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async addUser(req: Request, resp: Response) {
    const session: string = req.body.sessionId;
    delete req.body.sessionId;
    const chatId = req.params.id;
    const input: IAddUser = req.body as IAddUser;

    const usecaseResp = await this.chatGroupUsecases.addUser(
      session,
      chatId,
      input
    );
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async getChatById(req: Request, resp: Response) {
    const session: string = req.params.session;
    delete req.body.sessionId;
    const chatID = req.params.id;
    const usecaseResp = await this.chatGroupUsecases.getChatById(
      session,
      chatID
    );

    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private mapRoutes() {
    this._router.post('/', this.createChat.bind(this));
    this._router.get('/:id/:session', this.getChatById.bind(this));
    this._router.post('/:id', this.sendMessage.bind(this));
    this._router.put('/:id', this.addUser.bind(this));
  }
}
