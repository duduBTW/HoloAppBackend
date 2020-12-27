import express from 'express'
import youtubeRoutes from '@routes/youtube'
import cors from 'cors'
import communityRoutes from '@routes/community'
import { createConnection } from 'typeorm'

require('dotenv').config()

class AppController {
  express: express.Application;

  constructor () {
    this.express = express()
    this.connection()
    this.middlewares()
    this.routes()
  }

  connection () {
    createConnection().then(() => {
      console.log('Connection created.')
    }).catch(err => { if (err) throw err })
  }

  middlewares () {
    this.express.use(express.json())
    this.express.use(cors())
  }

  routes () {
    this.express.use('/youtube', youtubeRoutes)
    this.express.use('/community', communityRoutes)
  }
}

export default new AppController().express
