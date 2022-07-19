import InvalidUsernameError from '../exceptions/invalid_username';

export default class Profile {
  constructor(
    public hashtag: string,
    public globalCounter: number,
    public dailyCounter: number
  ) {
    if (hashtag.match(/^#/) == null) {
      throw new InvalidUsernameError(hashtag);
    }
  }
}
