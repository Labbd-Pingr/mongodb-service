import ChatGroup from '../model/chat_group';
import IChatGroupDataPort from '../ports/chat_group_data_port';
import { v4 } from 'uuid';
import { IAddUser, ICreateGroupChat } from './interface.group_chat';
import { ISendMessage } from './interface.chat';

export default class ChatGroupUsecases {
  constructor(protected readonly chatDataPort: IChatGroupDataPort) {}

  public async createChat({
    accountIds,
    ownerAccountId,
    isPrivate,
  }: ICreateGroupChat): Promise<string | null> {
    const id = v4();
    let chat;

    if (isPrivate) {
      const token = v4();
      chat = new ChatGroup(
        id,
        accountIds,
        [],
        ownerAccountId,
        isPrivate,
        token
      );
    } else {
      chat = new ChatGroup(id, accountIds, [], ownerAccountId, isPrivate);
    }
    const dbId = await this.chatDataPort.saveChat(chat);
    if (dbId == undefined) {
      console.log('[ERROR] Chat was not able to be created!');
      return null;
    }
    return id;
  }

  public async addUser(
    chatId: string,
    { accountId, chatToken }: IAddUser
  ): Promise<boolean> {
    try {
      const chats = await this.chatDataPort.get({
        id: chatId,
      });
      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];
      chat.addUser(accountId, chatToken);
      const dbId = await this.chatDataPort.addGroupUser(chat, accountId);

      if (dbId == undefined) throw new Error();

      return true;
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] User was not able to be added! ${error.message}`);
      return false;
    }
  }

  public async sendMessage(
    chatId: string,
    { senderId, text }: ISendMessage
  ): Promise<boolean> {
    try {
      const chats = await this.chatDataPort.get({ id: chatId });
      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];
      const message = chat.sendMessage(senderId, text);
      const dbId = await this.chatDataPort.addChatMessage(chat, message);
      if (dbId == undefined) throw new Error();
      return true;
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] Message was not able to be sent! ${error.message}`);
      return false;
    }
  }

  public async getChatByAccountIds(
    accountIds: string[]
  ): Promise<ChatGroup | null> {
    try {
      accountIds.sort();
      const chats = await this.chatDataPort.get({ accountIds: accountIds });

      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];
      return chat;
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Chat was not able to be retrieved! ${error.message}`
      );
      return null;
    }
  }

  public async getChatById(chatId: string): Promise<ChatGroup | null> {
    try {
      const chats = await this.chatDataPort.get({ id: chatId });

      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];
      return chat;
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Chat was not able to be retrieved! ${error.message}`
      );
      return null;
    }
  }
}
