import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import ChatGroupUsecases from 'src/domain/usecases/chat_group';
import { ISendMessage } from '../../../domain/usecases/interface.chat';
import ChatGroupDataAdapter from 'src/app/adapters/chat_group_data_adapter';
import { ICreateGroupChat } from 'src/domain/usecases/interface.group_chat';

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
    const input: ICreateGroupChat = req.body as ICreateGroupChat;

    const id = await this.chatGroupUsecases.createChat(input);
    if (id != null) resp.status(201).json(id);
    else resp.sendStatus(400);
  }

  private async sendMessage(req: Request, resp: Response) {
    const chatId = req.params.id;
    const input: ISendMessage = req.body as ISendMessage;

    if (await this.chatGroupUsecases.sendMessage(chatId, input))
      resp.sendStatus(201);
    else resp.sendStatus(400);
  }

  private mapRoutes() {
    this._router.post('/', this.createChat.bind(this));
    this._router.post('/:id', this.sendMessage.bind(this));
  }
}
