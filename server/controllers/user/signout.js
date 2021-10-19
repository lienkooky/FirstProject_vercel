const { sign } = require('jsonwebtoken');
const { isAuthorized } = require('../../controllers/tokenFunction')

module.exports = async (req, res) => {
  res.status(200).json({ data: { message: 'successfully signed out!', accessToken: '' } })
};
