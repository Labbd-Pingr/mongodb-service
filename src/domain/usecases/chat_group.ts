import ChatGroup from '../model/chat_group';
import IChatGroupDataPort from '../ports/chat_group_data_port';
import { v4 } from 'uuid';
import { ICreateGroupChat } from './interface.group_chat';
import ChatUsecases from './chat';

export default class ChatGroupUsecases extends ChatUsecases {
  constructor(chatDataPort: IChatGroupDataPort) {
    super(chatDataPort);
  }

  public async createChat({
    accountIds,
    ownerAccountId,
    isPrivate,
  }: ICreateGroupChat): Promise<string | null> {
    const id = v4();
    let chat;

    if (isPrivate) {
      const token = v4();
      chat = new ChatGroup(id, accountIds, ownerAccountId, isPrivate, token);
    } else {
      chat = new ChatGroup(id, accountIds, ownerAccountId, isPrivate);
    }
    const dbId = await this.chatDataPort.saveChat(chat);
    if (dbId == undefined) {
      console.log('[ERROR] Chat was not able to be created!');
      return null;
    }
    return id;
  }

  public async addUser(userId: string, chatToken: string): Promise<boolean> {
    try {
      const chats = await (this.chatDataPort as IChatGroupDataPort).get({
        token: chatToken,
      });
      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];
      chat.addUser(userId);
      return true;
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] User was not able to be added! ${error.message}`);
      return false;
    }
  }
}
