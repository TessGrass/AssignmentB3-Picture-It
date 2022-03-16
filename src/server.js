import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'

try {
  await connectDB()

  const app = express()

  app.use(helmet())

  app.use(logger('dev'))

  app.use(express.json())

  app.use('/', router)
  app.use(function (err, req, res, next) {
    console.log('---inside error auth-server---')
    if (err.status === 400) {
      res.status(400).json({ status_code: 400, message: 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error)' })
    } else if (err.status === 401) {
      res.status(401).json({ status_code: 401, message: 'Credentials invalid or not provided.' })
    } else if (err.status === 409) {
      res.status(409).json({ status_code: 409, message: 'The username and/or email address is already registered.' })
    } else if (err.status || err.status === 500) {
      res.status(500).json({ status_code: 500, message: 'An unexpected condition was encountered.' })
    }

    if (req.app.get('env') !== 'development') {
      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    }
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
