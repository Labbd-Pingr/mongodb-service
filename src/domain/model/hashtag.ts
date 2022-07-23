import InvalidHashtagError from '../exceptions/invalid_hashtag';

export default class Hashtag {
  constructor(
    public hashtag: string,
    public globalCounter: number,
    public dailyCounter: number
  ) {
    if (hashtag.match(/^#/) == null) {
      throw new InvalidHashtagError(hashtag);
    }
  }

  public updateGlobalCounter() {
    this.globalCounter += this.dailyCounter;
    this.dailyCounter = 0;
  }
}
