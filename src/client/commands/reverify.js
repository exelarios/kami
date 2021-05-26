const Command = require("../models/command");
const rbxAPI = require("../utils/robloxAPI");
const embeds = require("../utils/embeds");
const { Discord } = require("../utils/discord");
const { Message } = require("../models/message");

class Reverify extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Reverify your account to diferent roblox's username.",
            verifiedRequired: false,
            public: true,
            args: [
                {
                    "name": "username",
                    "description": "Your Roblox's username.",
                    "type": 3, // String
                    "required": true
                }
            ]
        });
    }

    async run(interaction, args, user) {
        const { username } = args;

        if (!user.document.exists) 
            throw new Message("Gekokujō's Verification", "Your account isn't associated with any roblox account, please verify using `/verify`");

        const userId = await rbxAPI.getUserIdByUsername(username);
        if (!userId)
            throw new Message("Gekokujō's Verification", "Please try again using a valid roblox username.");

        await user.document.update({
            verify: false,
            userId: userId,
            primary_clan: null
        });

        this.reply(interaction, {
            type: 4,
            data: await Discord.createAPIMessage(interaction, embeds.onVerify())
        });
    }

}

module.exports = Reverify;