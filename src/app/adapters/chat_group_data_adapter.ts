import { Collection, Db } from 'mongodb';
import { Message } from '../../domain/model/chat';
import ChatGroup from '../../domain/model/chat_group';
import IChatGroupDataPort, {
  ChatGroupQuery,
} from '../../domain/ports/chat_group_data_port';

export default class ChatGroupDataAdapter implements IChatGroupDataPort {
  private groupChatCollection: Collection;
  constructor(db: Db) {
    this.groupChatCollection = db.collection('chat_group');
  }

  public async saveChat(chat: ChatGroup): Promise<string | undefined> {
    const savedChat = await this.groupChatCollection.insertOne(chat);
    return savedChat.insertedId.toString();
  }

  public async addChatMessage(
    chat: ChatGroup,
    message: Message
  ): Promise<string | undefined> {
    const updateResult = await this.groupChatCollection.updateOne(
      { id: chat.id },
      { $push: { messages: message } }
    );

    const updatedChats = await this.get({ id: chat.id });

    if (updatedChats.length == 0) return undefined;
    return updatedChats[0].id;
  }

  public async addGroupUser(
    chat: ChatGroup,
    id: string
  ): Promise<string | undefined> {
    const updatedResult = await this.groupChatCollection.updateOne(
      {
        id: chat.id,
      },
      { $push: { accountIds: id } }
    );

    const updatedChats = await this.get({ id: chat.id });

    if (updatedChats.length == 0) return undefined;
    return updatedChats[0].id;
  }

  public async get(query: ChatGroupQuery): Promise<ChatGroup[]> {
    const chats = await this.groupChatCollection.find(query);
    return chats
      .map((chat) => {
        return chat.isPrivate
          ? new ChatGroup(
              chat.id,
              chat.accountIds,
              chat.messages,
              chat.ownerAccountId,
              chat.isPrivate,
              chat.token
            )
          : new ChatGroup(
              chat.id,
              chat.accountIds,
              chat.messages,
              chat.ownerAccountId,
              chat.isPrivate
            );
      })
      .toArray();
  }
}
