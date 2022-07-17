import { Entity, Schema } from 'redis-om';

export class AccountModel extends Entity {
  expirationDate!: number;
  accountId!: string;
}

export const accountSchema = new Schema(AccountModel, {
  accountId: { type: 'string' },
  expirationDate: { type: 'date' },
});
