import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { User } from '../../models/user-model.js'

/**
 * Represents av Authorize controller class.
 */
export class AuthController {
  /**
   * Register a new user.
   *
   * @param {*} req - Express request object.
   * @param {*} res  - Express respons object.
   * @param {*} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      console.log(req.body)
      const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
      })
      await newUser.save()
      res
        .status(201)
        .json({ id: newUser.id })
    } catch (error) {
      let err = error

      if (err.code === 11000) {
        // Duplicated keys.
        err = createError(409)
        err.cause = error
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.cause = error
      }

      next(err)
    }
  }

  /**
   * Login user.
   *
   * @param {*} req - Express request object.
   * @param {*} res  - Express respons object.
   * @param {*} next - Express next middleware function
   */
  async login (req, res, next) {
    console.log('inside login')
    try {
      const user = await User.authenticate(req.body.username, req.body.password)
      const secretKey = Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64')

      const payload = {
        username: user.username,
        email: user.email,
        id: user.id
      }

      const accessToken = jwt.sign(payload, secretKey, {
        algorithm: 'RS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      res
        .status(201)
        .json({
          access_token: accessToken
          // refresh_token: refreshToken
        })
    } catch (error) {
      // Authentication failed.
      const err = createError(401)
      err.cause = error
      next(err)
    }
  }
}
