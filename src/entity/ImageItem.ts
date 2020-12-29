import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

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

  // @ManyToOne(() => Content, content => content.images)
  // content: Content;
}
