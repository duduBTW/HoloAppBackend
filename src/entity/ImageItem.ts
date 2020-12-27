import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Content } from './Content'

@Entity({ name: 'image' })
export class ImageItem {
  @PrimaryGeneratedColumn('uuid')
  imageId: string;

  @Column({ nullable: true })
  low: string;

  @Column({ nullable: true })
  medium: string;

  @Column({ nullable: true })
  higth: string;

  @ManyToOne(() => Content, content => content.images)
  content: Content;
}
