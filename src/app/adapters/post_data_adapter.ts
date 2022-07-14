import { Collection, Db, DeleteResult } from 'mongodb';
import Profile from 'src/domain/model/profile';
import Post from '../../domain/model/post';
import IPostDataPort, { Query } from '../../domain/ports/post_data_port';
import Neo4jRepository from '../neo4j/neo4j_repository';

export default class PostDataAdapter implements IPostDataPort {
  private postCollection: Collection;
  private neo4j: Neo4jRepository;

  constructor(db: Db, neo4j: Neo4jRepository) {
    this.postCollection = db.collection('post');
    this.neo4j = neo4j;
  }

  public async savePost(post: Post): Promise<string | undefined> {
    const savedPost = await this.postCollection.insertOne(post);
    return savedPost.insertedId.toString();
  }

  public async likePost(post: Post, profile: Profile): Promise<number> {
    const profileId = 1

    this.neo4j.runCommand(
      'MATCH (u:user), (p:post) WHERE u.id = $userId AND p.id = $postId CREATE (u)-[r:LIKE]->(p)', 
      { userId: profileId, postId: post.id }
    )

    return 1
  }

  public async delete(query: Query): Promise<number> {
    const result: DeleteResult = await this.postCollection.deleteOne(query);
    return result.deletedCount;
  }

  public async get(query: Query): Promise<Post[]> {
    const posts = await this.postCollection.find(query);
    return posts
      .map((post) => {
        return new Post(post.id, post.profileId, post.datetime, post.text.text);
      })
      .toArray();
  }
}
