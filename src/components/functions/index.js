const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUser = functions.https.onRequest(async (req, res) => {
  const { uid } = req.body;
  try {
    await admin.auth().deleteUser(uid);
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting user: ' + error.message);
  }
});
