import { RequestWithTalent } from '@models/RequestWithTalent'
import { Response, NextFunction } from 'express'
import { Talent } from 'src/entity/Talent'
import { getRepository } from 'typeorm'

export const verifyTalent = (req: RequestWithTalent, res: Response, next: NextFunction): void | Response<unknown> => {
  const { token } = req.query

  if (!token) return res.status(401).send({ message: 'Acesso negado' })
  try {
    const talentRepo = getRepository(Talent)

    talentRepo.findOne({
      where: {
        talentId: token
      }
    }).then((talent) => {
      if (!talent) res.status(400).send({ message: 'Token inválido' })
      req.talent = talent
      next()
    })
  } catch (error) {
    res.status(400).send({ message: 'Token inválido' })
  }
}
