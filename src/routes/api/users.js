const express = require("express");
const db = require("../../util/firebase");
const router = express.Router();
const protected = require("../../middleware/protected");

router.get("/", async(req, res) => {
    res.send({
        message: "ok",
    })
});

router.get("/:userId", protected, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const users = db.collection("users");
    const snapshot = await users.where("userId", "==", userId).get();
    if (!snapshot.empty) {
        res.send({
            success: true,
            user: snapshot.docs[0].data()
        })
    } else {
        res.send({
            success: false,
            message: "Failed to fetch user."
        });
    }
});

module.exports = router;