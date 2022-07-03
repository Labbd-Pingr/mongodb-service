import Post from '../model/post';

export default interface IPostDataPort {
  save: (post: Post) => Promise<string | undefined>;
  getAll: () => Promise<Post[]>;
}
