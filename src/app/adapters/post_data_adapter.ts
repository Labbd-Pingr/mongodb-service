import { Collection, Db, DeleteResult } from 'mongodb';
import Post from '../../domain/model/post';
import IPostDataPort, { Query } from '../../domain/ports/post_data_port';

export default class PostDataAdapter implements IPostDataPort {
  private postCollection: Collection;
  constructor(db: Db) {
    this.postCollection = db.collection('post');
  }

  public async savePost(post: Post): Promise<string | undefined> {
    const savedPost = await this.postCollection.insertOne(post);
    return savedPost.insertedId.toString();
  }

  public async delete(query: Query): Promise<number> {
    const result: DeleteResult = await this.postCollection.deleteOne(query);
    return result.deletedCount;
  }

  public async get(query: Query): Promise<Post[]> {
    console.log('Query:' + query.id);
    const posts = await this.postCollection.find(query);
    console.log('Query result:');
    posts.forEach((post) => console.log(post));
    return posts
      .map((post) => {
        return new Post(post.id, post.profileId, post.datetime, post.text.text);
      })
      .toArray();
  }
}
