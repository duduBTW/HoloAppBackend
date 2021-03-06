import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

// Create a form to this on the app?
@Entity({ name: 'branch' })
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  branchId: string

  @Column()
  name: string
}
