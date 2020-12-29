import express, { Router } from 'express'
import YoutubeController from '@controllers/TalentController'
import MainPageController from '@controllers/MainPageController'
import { verifyTalent } from 'src/utils/auth'

const youtubeRoutes: Router = express.Router()

youtubeRoutes.get('/', verifyTalent, YoutubeController.find)
youtubeRoutes.get('/live', YoutubeController.liveStreams)
youtubeRoutes.get('/pog', verifyTalent, YoutubeController.pog)
youtubeRoutes.get('/createbranch', YoutubeController.createBranch)
youtubeRoutes.get('/createtalent', YoutubeController.createTalent)

youtubeRoutes.get('/main', MainPageController.find)

export default youtubeRoutes
