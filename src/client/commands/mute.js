const Command = require("../models/Command");

class Mute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Checks if the commands are working.",
            verifiedRequired: false,
            permissions: ["Moderator", "Administrator"],
            public: false,
            args: [
                {
                    "name": "offender",
                    "description": "the user that convicted a violated offense.",
                    "type": 6,
                    required: true
                },
                {
                    "name": "time",
                    "description": "the duration of the sentence.",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "record",
                    "description": "Is this considered a serious offense?",
                    "type": 5,
                    "required": true
                },
                {
                    "name": "reasoning",
                    "description": "What did the offender violated?",
                    "type": 3,
                    "required": true
                },
            ]
        });
    }

    async run(interaction, args, user) {
        const { offender, time, record, reasoning } = args;
        throw {
            title: "yes",
            message: "working"
        }
    }

}

module.exports = Mute;