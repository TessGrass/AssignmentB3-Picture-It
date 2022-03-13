import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'
const Schema = mongoose.Schema

const { isEmail } = validator

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[A-Za-z][A-Za-z0-9_-]{2,255}$/, 'Please provide a valid username.']
  },
  password: {
    type: String,
    required: true,
    writeOnly: true,
    minlength: [10, 'The password must be of minimum length 10 characters.'],
    maxlength: [256, 'The password must be of maximum length 256 characters.']
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'The firstname must be of minimum length 1 character.'],
    maxlength: [256, 'The firstname must be of maximum length 256 characters.']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'The firstname must be of minimum length 1 character.'],
    maxlength: [256, 'The firstname must be of maximum length 256 characters.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [254, 'The firstname must be of maximum length 256 characters.'],
    validate: [isEmail, 'Please provide a valid email address.']
  }
}, {
  timestamps: true,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

userSchema.virtual('id').get(function () {
  return this._id.toHexString()
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
