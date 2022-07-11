import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileModel } from './profile';

@Entity('account')
export class AccountModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @OneToOne(() => ProfileModel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  profile!: ProfileModel;
}
