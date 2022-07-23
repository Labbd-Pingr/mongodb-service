import ChatGroup from '../model/chat_group';
import IChatGroupDataPort from '../ports/chat_group_data_port';
import { v4 } from 'uuid';
import { IAddUser, ICreateGroupChat } from './interfaces/interface.group_chat';
import { ISendMessage } from './interfaces/interface.chat';
import AutheticationUsecases from './auth';
import { UsecaseResponse } from './interfaces/interface';

export default class ChatGroupUsecases {
  constructor(protected readonly chatDataPort: IChatGroupDataPort) {}

  @AutheticationUsecases.authorize()
  public async createChat(
    sessionId: string,
    { accountIds, ownerAccountId, isPrivate }: ICreateGroupChat
  ): Promise<UsecaseResponse<string>> {
    const id = v4();
    let chat;

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
  public async addUser(
    sessionId: string,
    chatId: string,
    { accountId, chatToken }: IAddUser
  ): Promise<UsecaseResponse<boolean>> {
    try {
      const chats = await this.chatDataPort.get({
        id: chatId,
      });
      if (chats.length == 0) throw new Error('Chat does not exist!');

      const chat = chats[0];

      const sessionAccountId = await (
        await AutheticationUsecases.sessionUsecases.getAndValidateSession(
          sessionId
        )
      ).response;

      if (accountId != sessionAccountId)
        throw new Error(
          'Account ID is different from obtained by account session'
        );

      chat.addUser(accountId, chatToken);
      const dbId = await this.chatDataPort.addGroupUser(chat, accountId);

      if (dbId == undefined) throw new Error();

      return {
        succeed: true,
        response: true,
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] User was not able to be added! ${error.message}`);
      return {
        succeed: false,
        errors: `[ERROR] User was not able to be added! ${error.message}`,
      };
    }
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
        errors: `[ERROR] User was not able to be added! ${error.message}`,
      };
    }
  }

  @AutheticationUsecases.authorize()
  public async getChatByAccountIds(
    sessionId: string,
    accountIds: string[]
  ): Promise<UsecaseResponse<ChatGroup>> {
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
  ): Promise<UsecaseResponse<ChatGroup>> {
    try {
      const chats = await this.chatDataPort.get({ id: chatId });

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
