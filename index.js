const urlencode = require('urlencode')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const { getFirebaseUser } = require('./src/lib/oauth')
require('dotenv').config()

exports.oauth = async (req, res) => {
  try {
    let { data: respData } = await axios({
      "method": "POST",
      "url": process.env.LINE_ISSUE_TOKE_ENDPOINT,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "data": `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${urlencode(process.env.LINE_REDIRECT_URI)}&client_id=${process.env.LINE_CHANNEL_ID}&client_secret=${process.env.LINE_CHANNEL_SECRET}`
    })
    let { access_token, expires_in, id_token, refresh_token, scope, token_type } = respData
    let { name, picture, email, sub: userId } = jwt.decode(id_token, LINE_NONCE)
    const token = await getFirebaseUser({ id: userId, uid: userId, name, picture, email })

    res.redirect(`${process.env.LINE_REDIRECT_URI_AFTER_TOKEN}/?token=${token}`)

  } catch (err) {

    console.log('main err', err)
    res.status(500).end()

  }
}
