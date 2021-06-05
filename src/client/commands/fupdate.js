const Command = require("../models/command");
const Collection = require("../../shared/collection");
const clearance = require("../utils/clearance");

class fUpdate extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "force updates the user's roles and tehir nickname.",
            permissions: clearance.admin,
            verifyRequired: false,
            public: false,
            args: [
                {
                    "name": "user",
                    "description": "The person that you want to force update.",
                    "required": true,
                    "type": 6
                }
            ]
        });
    }

    async run(interaction, args) {
        const { user: targetId } = args;

        const guild = await this.client.guilds.fetch(process.env.GUILD_ID);
        const target = await guild.members.fetch(targetId);

        target.document = new Collection("users", targetId);
        const doesExist = await target.document.exists();
        if (!doesExist)
            throw new Error("User doesn't exist in our database.");

        this.client.commands["update"].run(interaction, null, target);
    }

}

module.exports = fUpdate;