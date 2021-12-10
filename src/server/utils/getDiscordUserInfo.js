const axios = require("axios");

const getDiscordUserInfo = async function(req, res, next) {
    const uid = req.params.uid;
    try {
        const response = await axios.get(`https://discordapp.com/api/users/${uid}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
            }
        });
        req.user = response.data;
        next();
    } catch(error) {
        res.status(404).json({
            message: error.message,
            success: false
        })
    }
}

module.exports = getDiscordUserInfo;