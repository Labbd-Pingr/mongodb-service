import { Collection, Db } from 'mongodb';
import Chat from 'src/domain/model/chat';
import chat, { Message } from 'src/domain/model/chat';
import IChatDataPort, { Query } from 'src/domain/ports/chat_data_port';

export default class ChatDataAdapter implements IChatDataPort {
  private chatCollection: Collection;
  constructor(db: Db) {
    this.chatCollection = db.collection('chat');
  }

  public async saveChat(chat: chat): Promise<string | undefined> {
    const savedChat = await this.chatCollection.insertOne(chat);
    return savedChat.insertedId.toString();
  }

  public async addChatMessage(
    chat: chat,
    message: Message
  ): Promise<string | undefined> {
    const updatedChat = await this.chatCollection.updateOne(
      { id: chat.id },
      { $push: { messages: message } }
    );

    return updatedChat.upsertedId.toString();
  }

  public async get(query: Query): Promise<chat[]> {
    const chats = await this.chatCollection.find(query);
    return chats
      .map((chat) => {
        return new Chat(chat.id, chat.accountIds);
      })
      .toArray();
  }
}
