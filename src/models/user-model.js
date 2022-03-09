import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'The password must be of minimum length 8 characters.'],
    maxlength: [600, 'The password must be of maximum length 600 characters.']
  },
  firstName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
})

userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * Authenticates username and password.
 *
 * @param {object} username  - The username from the login attempt field.
 * @param {object} password  - The password from the login attempt field.
 * @returns {object} user that matches username.
 */
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid login attempt.')
  }
  return user
}

export const User = mongoose.model('User', userSchema)
