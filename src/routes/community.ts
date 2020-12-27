import express, { Router } from 'express'

import CommunityController from '@controllers/CommunityController'

const communityRoutes: Router = express.Router()

communityRoutes.get('/', CommunityController.find)
communityRoutes.get('/reddit', CommunityController.reddit)

export default communityRoutes
