import PostTooLongError from '../exceptions/post_too_long';

export class Text {
  public readonly hashtags: string[] = [];
  constructor(public readonly text: string) {
    const hashtagsOnText = text.match(/(#\S+)/g);
    if (hashtagsOnText != null) this.hashtags = hashtagsOnText;
  }
}

export default class Post {
  public readonly text: Text | null = null;

  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly datetime: Date,
    text: string
  ) {
    if (text.length > 140) {
      throw new PostTooLongError();
    }

    this.text = new Text(text);
  }
}
