const { discordAPI } = require("../../shared/axios");

module.roles = async function(req, res, next) {
    try {
        const response = await discordAPI.get(`guilds/${process.env.GUILD_ID}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${process.env.TOKEN}`,
            }
        });
        req.guild = response.data;
        next();
    } catch(error) {
        res.status(404).json({
            message: error.message,
            success: false
        });
    }
}

module.exports = module;