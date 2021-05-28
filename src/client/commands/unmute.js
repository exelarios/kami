const Command = require("../models/command");
const clearance = require("../utils/clearance");

class Unmute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Umutes an offender from being muted.",
            verifyRequired: false,
            permissions: clearance.admin,
            public: false,
            args: [
                {
                    "name": "offender",
                    "description": "the offender you want to unmute",
                    "required": true,
                    "type": 6, // User
                },
                {
                    "name": "reasoning",
                    "description": "the reason why you're letting the offender go.",
                    "required": true,
                    "type": 3, // String
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