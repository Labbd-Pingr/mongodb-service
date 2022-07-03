export default class NotAllowedError extends Error {
  constructor(userId: string) {
    super(
      `User with id ${userId} is not allowed to send messages in this chat!`
    );
  }
}
