import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountModel } from './account';

@Entity('profile')
export class ProfileModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  username!: string;

  @Column()
  name!: string;

  @Column('text')
  bio!: string;

  @Column({
    nullable: true,
  })
  birthDate!: Date;

  @OneToOne(() => AccountModel, (account) => account.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  account!: AccountModel;
}
