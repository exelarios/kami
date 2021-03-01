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
    const users = db.collection("users");
    const userId = parseInt(req.params.userId);
    const snapshot = await users.where("userId", "==", userId).get();
    if (!snapshot.empty) {
        const discord_id = snapshot.docs[0].id;
        res.send({
            success: true,
            user: {...snapshot.docs[0].data(), discord_id}
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

module.exports = router;