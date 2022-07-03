import { Collection, Db } from 'mongodb';
import Post from '../../domain/model/post';
import IPostDataPort from '../../domain/ports/post_data_port';

export default class PostDataAdapter implements IPostDataPort {
  private postCollection: Collection;
  constructor(db: Db) {
    this.postCollection = db.collection('post');
  }

  public async save(post: Post): Promise<string | undefined> {
    const savedPost = await this.postCollection.insertOne(post);
    return savedPost.insertedId.toString();
  }

  public async getAll(): Promise<Post[]> {
    const posts = await this.postCollection.find({});
    return posts
      .map((post) => {
        return new Post(
          post.profile_id,
          post.datetime,
          post.text.text,
          post._id.toString()
        );
      })
      .toArray();
  }
}
