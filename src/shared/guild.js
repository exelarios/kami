const { discordAPI } = require("./axios");

class Guild {

    constructor(guildId) {
        this.id = guildId;
    }

    async roles(req, res, next) {
        console.log(this.id);
        const response = await discordAPI.get(`guilds/${this.id}`);
        req.guild.roles = response.data;
        next();
    }

}

module.exports = Guild;