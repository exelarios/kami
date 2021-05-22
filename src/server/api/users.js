const express = require("express");
const db = require("../utils/firebase");
const router = express.Router();
const protected = require("../middleware/protected");
const client = require("../../utils/discord");

router.get("/", async(req, res) => {
    res.send({
        message: "ok",
    })
});

router.get("/:userId", protected, async (req, res) => {
    const users = db.collection("users");
    const userId = parseInt(req.params.userId);
    const snapshot = await users.where("userId", "==", userId).get();

    if (!snapshot.empty) {
        let sameUserId = {};
        snapshot.docs.map(doc => {
            sameUserId[doc.id] = doc.data();
        });
        res.send({
            success: true,
            users: sameUserId,
        })
    } else {
        res.send({
            success: false,
            message: "Failed to fetch user."
        });
    }
});

router.put("/:id", protected, async (req, res) => {
    const { id } = req.params;

    const users = db.collection("users");
    const user = await users.doc(id).get();
    if (user.exists) {
        const snapshot = user.data();
        try {
            await users.doc(id).update({
                primary_clan: req.body?.primary_clan || snapshot.primary_clan,
                verify: req.body?.verify || snapshot.verify
            });
            res.send({
                success: true
            })
        } catch(error) {
            res.status(404).send({
                success: false
            })
            console.log(`Failed to verify ${id}.`);
            console.error(error);
        }
    } else {
        res.status(404).send({
            success: false
        })
        console.log(`Failed to find ${id} user.`);
    }
});

router.delete("/:id", protected, async (req, res) => {
    const { id } = req.params;
    const users = db.collection("users");
    const user = await users.doc(id).get();
    if (user.exists) {
        await users.doc(id).delete();
        res.send({
            success: true
        });
    } else {
        res.status(404).send({
            success: false
        });
        console.log(`Failed to find ${id} user.`);
    }
});

router.post("/:id/update", protected, async (req, res) => {
    const { id } = req.params;
    client.functions["verify"].update(client, db, id);
    res.send({
        success: true
    })
});

module.exports = router;