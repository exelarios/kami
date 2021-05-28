const firebase = require("firebase-admin");

firebase.initializeApp({
    credential: firebase.credential.cert({
        "project_id": process.env.PROJECT_ID,
        "client_email": process.env.CLIENT_EMAIL,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: "https://kami-34807-default-rtdb.firebaseio.com/"
});

module.exports = firebase.firestore();