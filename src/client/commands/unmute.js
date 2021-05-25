const Command = require("../models/command");

class Unmute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Umutes an offender from being muted.",
            verifiedRequired: false,
            permissions: ["Moderator", "Administrator"],
            public: false,
            args: [
                {
                    "name": "offender",
                    "description": "the offender you want to unmute",
                    "required": true,
                    "type": 6, // User
                }
            ]
        });
    }

    async run(interaction, args) {
        const { offender } = args;
        throw {
            title: "Unmute",
            message: "yeeeeeeeeeee"
        }        
    }

}

module.exports = Unmute;