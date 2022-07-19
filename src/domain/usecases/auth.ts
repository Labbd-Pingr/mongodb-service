import SessionUsecases from './session';

export default class AutheticationUsecases {
  public static sessionUsecases: SessionUsecases;

  public static setAuthetication(sessionUsecases: SessionUsecases) {
    AutheticationUsecases.sessionUsecases = sessionUsecases;
  }

  public static authorize() {
    return function (
      target: unknown,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const method = descriptor.value;

      descriptor.value = async function (...args: unknown[]) {
        const authResponse =
          await AutheticationUsecases.sessionUsecases.getAndValidateSession(
            args[0] as string
          );
        if (!authResponse.succeed) return authResponse;

        return method.apply(this, args);
      };
    };
  }
}
