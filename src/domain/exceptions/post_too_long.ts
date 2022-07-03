export default class PostTooLongError extends Error {
  constructor() {
    super(`Post text has too many characteres! Maximum: 140.`);
  }
}
