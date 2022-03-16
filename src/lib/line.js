const urlencode = require('urlencode')
const axios = require('axios')
const jwt = require('jsonwebtoken')

async function getLineUser(req, res) {
  let { data: respData } = await axios({
    "method": "POST",
    "url": process.env.LINE_ISSUE_TOKE_ENDPOINT,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "data": `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${urlencode(process.env.LINE_REDIRECT_URI)}&client_id=${process.env.LINE_CHANNEL_ID}&client_secret=${process.env.LINE_CHANNEL_SECRET}`
  })

  // {
  //   "access_token": "bNl4YEFPI/hjFWhTqexp4MuEw5YPs...",
  //   "expires_in": 2592000,
  //   "id_token": "eyJhbGciOiJIUzI1NiJ9...",
  //   "refresh_token": "Aa1FdeggRhTnPNNpxr8p",
  //   "scope": "profile",
  //   "token_type": "Bearer"
  // }

  const { access_token, expires_in, id_token, refresh_token, scope, token_type } = respData
  // decode user profile of id_token 
  const user = jwt.decode(id_token, LINE_NONCE)
  return user
}

module.exports = {
  getLineUser
}