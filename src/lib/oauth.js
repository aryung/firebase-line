const admin = require("firebase-admin")
const serviceAccount = require('../../credentials/firebase-private-key.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_ENDPOINT
})


async function getFirebaseUser(payload) {
  try {
    const { uid, name, picture, email } = payload

    const uidExists = await admin.auth().getUser(uid).then(() => true).catch(() => false)
    let userRecord
    if (uidExists) {
      userRecord = await admin.auth().getUser(uid)
    } else {
      userRecord = await admin.auth().createUser({
        uid: uid,
        displayName: name,
        photoURL: picture,
        email: email
      })
    }

    // Revoke all refresh tokens for a specified user for whatever reason.
    // Retrieve the timestamp of the revocation, in seconds since the epoch.
    // admin
    //   .auth()
    //   .revokeRefreshTokens(uid)
    //   .then(() => {
    //     return admin.auth().getUser(uid)
    //   })
    //   .then((userRecord) => {
    //     return new Date(userRecord.tokensValidAfterTime).getTime() / 1000
    //   })
    //   .then((timestamp) => {
    //     console.log(`Tokens revoked at: ${timestamp}`)
    //   })

    const token = await admin.auth().createCustomToken(uid)
    return token

  } catch (err) {
    return Promise.reject(err)
  }
}


module.exports = {
  getFirebaseUser,
  firebaseAdmin: admin
}