export default interface ILoginDataPort {
  doesAccountHaveAValidSession: (accountId: string) => Promise<boolean>;
  isAValidSession: (sessionId: string) => Promise<boolean>;
  getAccountBySession: (sessionId: string) => Promise<string>;
  logIn: (accountId: string) => Promise<string>;
  logout: (sessionId: string) => Promise<void>;
}
