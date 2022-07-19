export default class InvalidHashtagError extends Error {
  constructor(hashtag: string) {
    super(`Invalid username! Every hashtag must start with '#'. ${hashtag}`);
  }
}
