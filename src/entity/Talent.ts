import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './Branch'

// Create a form to this on the app?
@Entity({ name: 'talent' })
export class Talent {
  @PrimaryGeneratedColumn('uuid')
  talentId: string

  @Column()
  name: string

  @Column()
  image: string

  @Column()
  description: string

  @Column()
  color: string

  // Do something on the UI with this owo
  @Column()
  birthday: Date

  @Column()
  heigth: string

  @Column()
  youtubeId: string

  @Column()
  twitterName: string

  @OneToOne(() => Branch)
  @JoinColumn()
  branch: Branch;
}
