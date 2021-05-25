const Command = require("../models/command");
const rbxAPI = require("../utils/robloxAPI");
const embeds = require("../utils/embeds");
const { Discord } = require("../utils/discord");
class Verify extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "verifies identity between your roblox and discord account.",
            cooldown: 1,
            public: true,
            verifiedRequired: true,
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
        if (!user.exists) {
            // Ensure the inputted roblox username is valid & gets the userId by username.
            const userId = await rbxAPI.getUserIdByUsername(username);
            if (!userId) {
                throw {
                    title: "Gekokujō's Verification",
                    message: "Please try again using a valid roblox username."
                };
            }

            await user.create(userId);
            this.reply(interaction, {
                type: 4,
                data: await Discord.createAPIMessage(interaction, embeds.onVerify())
            });
        } else {
            // If they are within the database, now check if they are verified.
            if (!user.isVerified) {
                const pendingUserId = user.data.userId;
                const username = await rbxAPI.getUsernameByUserId(pendingUserId);
                if (!username)
                    throw new Error("Failed to fetch Roblox's username by userId.");
                this.reply(interaction, {
                    type: 4,
                    data: await Discord.createAPIMessage(interaction, embeds.pendingVerification({
                        username: username
                    }))
                });
            } else {
                // Prompts them different commnads to run.
                this.reply(interaction, {
                    type: 4,
                    data: await Discord.createAPIMessage(interaction, embeds.verified())
                })
            }
        }
    }

}

module.exports = Verify;