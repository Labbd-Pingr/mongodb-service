import Chat from '../model/chat';
import IChatDataPort from '../ports/chat_data_port';
import { v4 } from 'uuid';
import { IChatCreate, ISendMessage } from './interface.chat';

export default class ChatUsecases {
  constructor(private readonly chatDataPort: IChatDataPort) {}

  public async createChat({ accountIds }: IChatCreate) {
    const id = v4();
    const chat = new Chat(id, accountIds);
    const dbId = await this.chatDataPort.saveChat(chat);
    if (dbId == undefined) {
      console.log('[ERROR] Chat was not able to be created!');
      return null;
    }
    return id;
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

  //TODO
  // public async getChatByAccountIds(accountIds: string[]) {}

  //TODO
  // public async getChatById(chatId: string) {}
}
