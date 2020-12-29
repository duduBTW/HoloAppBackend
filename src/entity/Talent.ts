import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './Branch'
import { Content } from './Content'

// Create a form to this on the app?
@Entity({ name: 'talent' })
export class Talent {
  @PrimaryGeneratedColumn('uuid')
  talentId: string

  @Column()
  name: string

  @Column()
  image: string

  @Column({ nullable: true, length: 500 })
  description: string

  @Column()
  color: string

  // Do something on the UI with this owo
  @Column()
  debutDate: Date

  @Column()
  birthday: string

  @Column()
  heigth: string

  @Column()
  youtubeId: string

  @Column()
  twitterName: string

  @OneToOne(() => Branch)
  @JoinColumn()
  branch: Branch;

  @OneToMany(() => Content, video => video.id)
  videos: Content[];
}
