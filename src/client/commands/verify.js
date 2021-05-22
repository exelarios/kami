const Command = require("../models/Command");
const rbxAPI = require("../utils/robloxAPI");
const embeds = require("../utils/embeds");

const emojis = {
    "one": "1️⃣",
    "two": "2️⃣",
    "three": "3️⃣",
    "four": "4️⃣",
    "five": "5️⃣",
    "six": "6️⃣",
    "seven": "7️⃣",
    "eight": "8️⃣",
    "nine": "9️⃣",
    "ten": "🔟",
    "yes": "✅",
    "exit": "❌"
};

class Verify extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "verifies identity between your roblox and discord account.",
            cooldown: 1,
            args: [
                {
                    name: "username",
                    description: "Your Roblox's username.",
                    type: 3, // String
                    require: true
                }
            ]
        });
    }

    async run(msg, args, user) {
        console.log("yeee");
        const [username] = args;
        let output = "";
        try {
            if (!user.exists) {
                // Ensure the inputted roblox username is valid & gets the userId by username.
                const userId = await rbxAPI.getUserIdByUsername(username);
                if (!userId) {
                    msg.reply("Please try again using a valid roblox username.");
                    return;
                }

                await user.create(userId);
                msg.reply(embeds.onVerify());
            } else {
                // If they are within the database, now check if they are verified.
                if (!user.isVerified()) {
                    const pendingUserId = user.get().userId;
                    const username = await rbxAPI.getUsernameByUserId(pendingUserId);
                    msg.reply(embeds.pendingVerify({username}));
                } else {
                    // Prompts them different commnads to run.
                    msg.reply(embeds.alreadyVerified());
                }
            }
        } catch(error) {
            this.onError(error);
        }
        // } finally {
        //     client.api.interactions(interaction.id, interaction.token).callback.post({
        //         data: {
        //             type: 4,
        //             data: {
        //                 content: output
        //             }
        //         }
        //     });
        // }
    }

}

module.exports = Verify;