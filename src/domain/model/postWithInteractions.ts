import Post from './post';

export default class PostWithInteractions {
  constructor(
    public readonly post: Post,
    public readonly replies: Post[] = [],
    public readonly sharedPost: Post | null = null
  ) {}
}
