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
    await this.neo4j.runCommand('CREATE (:post {postId: $id})', {
      id: post.id,
    });
    return savedPost.insertedId.toString();
  }

  public async sharePost(
    createdPostId: string,
    sharedPostId: string
  ): Promise<number> {
    await this.neo4j.runCommand(
      'MATCH (p1: post), (p2: post) WHERE p1.postId = $postId AND p2.postId = $sharedPostId CREATE (p1)-[:SHARE]->(p2)',
      { postId: createdPostId, sharedPostId: sharedPostId }
    );
    return 1;
  }

  public async likePost(post: Post, profile: Profile): Promise<number> {
    // Usar o id do profile aqui
    const profileId = 1;

    await this.neo4j.runCommand(
      'MATCH (p:profile), (p:post) WHERE p.profileId = $profileId AND p.postId = $postId CREATE (u)-[r:LIKE]->(p)',
      { profileId: profileId, postId: post.id }
    );
    return 1;
  }

  public async delete(query: Query): Promise<number> {
    const result: DeleteResult = await this.postCollection.deleteOne(query);
    await this.neo4j.runCommand(
      'MATCH (p: post) WHERE p.postId = $postId DETACH DELETE p',
      { postId: query.id }
    );
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
