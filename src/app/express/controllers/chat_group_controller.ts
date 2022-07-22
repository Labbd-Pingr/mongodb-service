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
    const session: string = req.body.session;
    delete req.body.session;
    const input: ICreateGroupChat = req.body as ICreateGroupChat;

    const id = await this.chatGroupUsecases.createChat(session, input);
    if (id != null) resp.status(201).json(id);
    else resp.sendStatus(400);
  }

  private async sendMessage(req: Request, resp: Response) {
    const session: string = req.body.session;
    delete req.body.session;
    const chatId = req.params.id;
    const input: ISendMessage = req.body as ISendMessage;

    if (await this.chatGroupUsecases.sendMessage(session, chatId, input))
      resp.sendStatus(201);
    else resp.sendStatus(400);
  }

  private async addUser(req: Request, resp: Response) {
    const session: string = req.body.session;
    delete req.body.session;
    const chatId = req.params.id;
    const input: IAddUser = req.body as IAddUser;

    if (await this.chatGroupUsecases.addUser(session, chatId, input))
      resp.sendStatus(201);
    else resp.sendStatus(400);
  }

  private async getChatById(req: Request, resp: Response) {
    const session: string = req.body.session;
    delete req.body.session;
    const chatID = req.params.id;
    const chat = await this.chatGroupUsecases.getChatById(session, chatID);

    if (chat) resp.status(200).json(chat);
    else resp.sendStatus(400);
  }

  private mapRoutes() {
    this._router.post('/', this.createChat.bind(this));
    this._router.get('/:id', this.getChatById.bind(this));
    this._router.post('/:id', this.sendMessage.bind(this));
    this._router.put('/:id', this.addUser.bind(this));
  }
}
