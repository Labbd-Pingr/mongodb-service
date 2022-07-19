import { Collection, Db, DeleteResult } from 'mongodb';
import PostWithInteractions from '../../domain/model/postWithInteractions';
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
    await this.neo4j.runCommand(
      'MATCH (u:user), (p:post) WHERE u.accountId = $accountId AND p.postId = $postId CREATE (u)-[:PUBLISH]->(p)',
      { accountId: post.accountId.toString(), postId: post.id }
    );
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

  public async replyToPost(
    createdPostId: string,
    sharedPostId: string
  ): Promise<number> {
    await this.neo4j.runCommand(
      'MATCH (p1: post), (p2: post) WHERE p1.postId = $postId AND p2.postId = $sharedPostId CREATE (p1)-[:REPLY]->(p2)',
      { postId: createdPostId, sharedPostId: sharedPostId }
    );
    return 1;
  }

  public async likePost(post: Post, accountId: string): Promise<number> {
    await this.neo4j.runCommand(
      'MATCH (u:user), (p:post) WHERE u.accountId = $accountId AND p.postId = $postId CREATE (u)-[r:LIKE]->(p)',
      { accountId: accountId.toString(), postId: post.id }
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

  public async getWithInteractions(
    query: Query
  ): Promise<PostWithInteractions[]> {
    const postsDocuments = await this.postCollection.find(query);

    const postWithInteractions: PostWithInteractions[] = [];
    const posts = await postsDocuments
      .map((post) => {
        return new Post(post.id, post.profileId, post.datetime, post.text.text);
      })
      .toArray();
    for (const post of posts) {
      const withInteractions = new PostWithInteractions(
        post,
        await this.getRepliesTo(post.id),
        await this.getSharedBy(post.id)
      );
      postWithInteractions.push(withInteractions);
    }
    return postWithInteractions;
  }

  private async getRepliesTo(postId: string): Promise<Post[]> {
    const result = await this.neo4j.runCommand(
      'MATCH (p1: post) -[:REPLY]-> (p2: post) WHERE p2.postId = $postId return p1.postId as postId',
      { postId }
    );

    const posts: Post[] = [];
    result.records.forEach(async (record) => {
      const reply = await this.get({ id: record.get('postId') });
      posts.push(reply[0]);
    });

    return posts;
  }

  private async getSharedBy(postId: string): Promise<Post | null> {
    const result = await this.neo4j.runCommand(
      'MATCH (p1: post) -[:SHARE]-> (p2: post) WHERE p1.postId = $postId return p2.postId as postId',
      { postId }
    );
    const sharedPost = result.records[0]
      ? (await this.get({ id: result.records[0].get('postId') }))[0]
      : null;

    return sharedPost;
  }
}
