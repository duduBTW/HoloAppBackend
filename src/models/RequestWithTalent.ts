import { Request } from 'express'
import { Talent } from 'src/entity/Talent'

export interface RequestWithTalent extends Request {
  talent: Talent;
}
