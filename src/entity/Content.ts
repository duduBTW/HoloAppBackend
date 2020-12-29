import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm'
import { Talent } from './Talent'

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

    @ManyToOne(() => Talent, talent => talent.talentId)
    @JoinColumn()
    talent: Talent;
}
