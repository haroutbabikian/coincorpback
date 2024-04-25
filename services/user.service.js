const db = require('../config/db')
const bcrypt = require('bcryptjs')

/**
 * Create a new User
 * @param {Object} userData
 * @returns {Promise<User>}
 */

const createUser = async(userData) => {

    const {first_name, last_name, email, password, phone_number} = userData

    const hashPassword = await bcrypt.hashSync(password, 10)

    const user = await db('users').insert( {first_name, last_name, email, password: hashPassword, phone_number})
    return user
}

/**
 * Find User By Email
 * @param {String} email
 * @returns {Promise<User>}
 */

const findUserByEmail = async(email) => {
    const user = await db.select('*').from('users').where('email', email).first()
    return user
}

/**
 * Find User By Phone Number
 * @param {String} phoneNumber
 * @returns {Promise<User>}
 */
const findUserByPhoneNumber = async (phoneNumber) => {
    const user = await db.select('*').from('users').where('phone_number', phoneNumber).first();
    return user;
};

/**
 * Get Profile
 * @param {Object} userData
 * @returns {Promise<User>}
 */

 const getProfile = async(userData) => {
    const user = await findUserByEmail(userData.email)
    delete user.password
    return user
}


module.exports = {
    createUser,
    findUserByEmail,
    getProfile,
    findUserByPhoneNumber
  };