const express = require("express");
const db = require("../../../shared/firebase");
const router = express.Router();
const protected = require("../../middleware/protected");

const getDiscordUserInfo = require("../../utils/getDiscordUserInfo");
/*
    Checks if the route is running.
*/
router.get("/", async(req, res) => {
    res.send({
        message: "ok",
    })
});

// router.get("/rbx/:id", protected, async (req, res) => {
//     const userId = parseInt(req.params.id);
//     try {
//         const users = db.collection("users");
//         const snapshot = await users.where("userId", "==", userId).get();
//         if (snapshot.empty)
//             throw new Error("Failed to find any members associated with the roblox userId.");

//         let documents = {};
//         snapshot.docs.map(doc => {
//             documents[doc.id] = doc.data();
//         });
//         res.send({
//             success: true,
//             users: documents
//         });
//     } catch(error) {
//         res.status(404).send({
//             success: false,
//             message: error.message
//         });
//     }
// });

router.get("/user/:uid", protected, getDiscordUserInfo, async (req, res) => {
    res.send({
        success: true,
        user: req.user
    });
});

module.exports = router;