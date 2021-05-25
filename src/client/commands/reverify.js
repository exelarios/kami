const Command = require("../models/command");
const rbxAPI = require("../utils/robloxAPI");
const embeds = require("../utils/embeds");
const { Discord } = require("../utils/discord");

class Reverify extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Reverify your account to diferent roblox's username.",
            verifiedRequired: false,
            public: false,
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
        if (user.exists) {
            const userId = await rbxAPI.getUserIdByUsername(username);
            if (!userId) {
                throw {
                    title: "Gekokujō's Verification",
                    message: "Please try again using a valid roblox username."
                };
            }

            await user.update({
                verify: false,
                userId: userId,
                primary_clan: null
            });

            this.reply(interaction, {
                type: 4,
                data: await Discord.createAPIMessage(interaction, embeds.onVerify())
            });
        } else {
            throw {
                title: "Gekokujō's Verification",
                message: "Your account isn't associated with any roblox account, please verify using `/verify`"
            };
        }

    }

}

module.exports = Reverify;