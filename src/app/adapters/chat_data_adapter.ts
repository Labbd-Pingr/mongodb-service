import { Collection, Db } from 'mongodb';
import Chat, { Message } from '../../domain/model/chat';
import IChatDataPort, { Query } from '../../domain/ports/chat_data_port';

export default class ChatDataAdapter implements IChatDataPort {
  private chatCollection: Collection;
  constructor(db: Db) {
    this.chatCollection = db.collection('chat');
  }

  public async saveChat(chat: Chat): Promise<string | undefined> {
    console.log(chat);
    const savedChat = await this.chatCollection.insertOne(chat);
    console.log(await this.chatCollection.findOne());
    return savedChat.insertedId.toString();
  }

  public async addChatMessage(
    chat: Chat,
    message: Message
  ): Promise<string | undefined> {
    const updateResult = await this.chatCollection.updateOne(
      { id: chat.id },
      {
        $push: { messages: message },
      }
    );

    const updatedChats = await this.get({ id: chat.id });

    if (updatedChats.length == 0) return undefined;
    return updatedChats[0].id;
  }

  public async get(query: Query): Promise<Chat[]> {
    const chats = await this.chatCollection.find(query);

    return chats
      .map((chat) => {
        return new Chat(chat.id, chat.accountIds, chat.messages);
      })
      .toArray();
  }
}
