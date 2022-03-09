import express from 'express'
import { AuthController } from '../../../controllers/api/auth-controller.js'
export const router = express.Router()

const controller = new AuthController()

router.post('/register', (req, res, next) => controller.register(req, res, next))
