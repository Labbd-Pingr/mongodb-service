import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('hashtag')
export class HashtagModel {
  @PrimaryColumn()
  hashtag!: string;

  @Column()
  globalCounter!: number;

  @Column()
  dailyCounter!: number;
}
