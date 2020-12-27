import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ImageItem } from './ImageItem'

@Entity({ name: 'youtube' })
export class Content {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    integrationId: string;

    @Column()
    type: number;

    @Column()
    date: Date;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image: string;

    @OneToMany(() => ImageItem, images => images.content)
    images: ImageItem[]
}
