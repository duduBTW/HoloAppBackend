import express, { Router } from 'express'
import YoutubeController from '@controllers/TalentController'
import MainPageController from '@controllers/MainPageController'

const youtubeRoutes: Router = express.Router()

youtubeRoutes.get('/', YoutubeController.find)
youtubeRoutes.get('/live', YoutubeController.liveStreams)

youtubeRoutes.get('/main', MainPageController.find)

export default youtubeRoutes
