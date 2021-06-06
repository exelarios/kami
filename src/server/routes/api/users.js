const express = require("express");
const db = require("../../../shared/firebase");
const router = express.Router();
const protected = require("../../middleware/protected");
const Collection = require("../../../shared/collection");
const client = require("../../../client/index");

/*
    Checks if the route is running.
*/
router.get("/", async(req, res) => {
    res.send({
        message: "ok",
    })
});

router.get("/:userId", protected, async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const users = db.collection("users");
        const snapshot = await users.where("userId", "==", userId).get();
        if (snapshot.empty)
            throw new Error("Failed to find any members associated with the roblox userId.");

        let documents = {};
        snapshot.docs.map(doc => {
            documents[doc.id] = doc.data();
        });
        res.send({
            success: true,
            users: documents
        });
    } catch(error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

router.put("/:id", protected, async (req, res) => {
    const { id } = req.params;
    const document = new Collection("users", id);
    const snapshot = await document.data();
    try {
        await document.update({
            primary_clan: req.body?.primary_clan || null,
            verify: req.body?.verify,
            last_updated: Math.floor(new Date().getTime() / 1000)
        });
        res.send({
            success: true
        });
    } catch(error) {
        res.status(404).send({
            success: false,
            message: error.message
        })
    }
});

router.delete("/:id", protected, async (req, res) => {
    const { id } = req.params;
    try {
        const document = new Collection("users", id);
        await document.delete();
        res.send({
            success: true
        });
    } catch(error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

router.post("/:id/update", protected, async (req, res) => {
    const { id } = req.params;
    try {
        await client.commands["update"].update(id);
        res.send({
            success: true
        });
    } catch(error) {
        console.log(error);
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;