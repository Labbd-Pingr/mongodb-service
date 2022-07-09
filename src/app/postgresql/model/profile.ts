import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
