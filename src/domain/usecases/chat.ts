import Chat from '../model/chat';
import IChatDataPort from '../ports/chat_data_port';
import { v4 } from 'uuid';
import { ICreateChat, ISendMessage } from './interfaces/interface.chat';
import AutheticationUsecases from './auth';
import { UsecaseResponse } from './interfaces/interface';

export default class ChatUsecases {
  constructor(protected readonly chatDataPort: IChatDataPort) {}

  @AutheticationUsecases.authorize()
  public async createChat(
    sessionId: string,
    { accountIds }: ICreateChat
  ): Promise<UsecaseResponse<string>> {
    const accountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(
        sessionId
      )
    ).response;

    if (accountId && !accountIds.includes(accountId)) {
      console.log('[ERROR] The accountIds do not include the user');
      return {
        succeed: false,
        errors: 'The accountIds do not include the user',
      };
    }
    const id = v4();
    const chat = new Chat(id, accountIds);
    const dbId = await this.chatDataPort.saveChat(chat);
    if (dbId == undefined) {
      console.log('[ERROR] Chat was not able to be created!');
      return {
        succeed: false,
        errors: 'Chat was not able to be created!',
      };
    }
    return {
      succeed: true,
      response: id,
    };
  }

  @AutheticationUsecases.authorize()
  public async sendMessage(
    sessionId: string,
    chatId: string,
    { senderId, text }: ISendMessage
  ): Promise<UsecaseResponse<boolean>> {
    try {
      const accountId = await (
        await AutheticationUsecases.sessionUsecases.getAndValidateSession(
          sessionId
        )
      ).response;

      if (accountId != senderId) {
        throw new Error(
          'Sender ID is different from obtained by account session'
        );
      }

      const chats = await this.chatDataPort.get({ id: chatId });
      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];
      const message = chat.sendMessage(senderId, text);

      const dbId = await this.chatDataPort.addChatMessage(chat, message);
      if (dbId == undefined) throw new Error();
      return {
        succeed: true,
        response: true,
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] Message was not able to be sent! ${error.message}`);
      return {
        succeed: false,
        errors: `Message was not able to be sent! ${error.message}`,
      };
    }
  }

  @AutheticationUsecases.authorize()
  public async getChatByAccountIds(
    sessionId: string,
    accountIds: string[]
  ): Promise<UsecaseResponse<Chat>> {
    try {
      const accountId = await (
        await AutheticationUsecases.sessionUsecases.getAndValidateSession(
          sessionId
        )
      ).response;

      if (accountId && !accountIds.includes(accountId)) {
        console.log('[ERROR] The accountIds do not include the user');
        return {
          succeed: false,
          errors: 'The accountIds do not include the user',
        };
      }

      accountIds.sort();
      const chats = await this.chatDataPort.get({ accountIds: accountIds });

      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];

      return {
        succeed: true,
        response: chat,
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Chat was not able to be retrieved! ${error.message}`
      );
      return {
        succeed: false,
        errors: `[ERROR] Chat was not able to be retrieved! ${error.message}`,
      };
    }
  }

  @AutheticationUsecases.authorize()
  public async getChatById(
    sessionId: string,
    chatId: string
  ): Promise<UsecaseResponse<Chat>> {
    try {
      const chats = await this.chatDataPort.get({ id: chatId });
      console.log(chatId, chats, 'aaaaaaah');
      if (chats.length == 0) throw new Error('Chat does not exist!');

      const accountId = await (
        await AutheticationUsecases.sessionUsecases.getAndValidateSession(
          sessionId
        )
      ).response;

      const chat = chats[0];
      if (accountId && !chat.accountIds.includes(accountId)) {
        throw new Error(
          'Sender ID is different from obtained by account session'
        );
      }
      return {
        succeed: true,
        response: chat,
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Chat was not able to be retrieved! ${error.message}`
      );
      return {
        succeed: false,
        errors: `[ERROR] Chat was not able to be retrieved! ${error.message}`,
      };
    }
  }
}
