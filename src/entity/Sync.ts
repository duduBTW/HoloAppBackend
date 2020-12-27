import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity({ name: 'sync' })
export class Sync {
  @PrimaryColumn()
  talentId: string;

  @Column()
  lastSynced: Date;
}
