const Command = require("../models/Command");

class Mute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Checks if the commands are working.",
            userPermission: "MANAGE_ROLES",
            args: [
                {
                    name: "user",
                    description: "the offender",
                    type: 6,
                    required: true
                },
                {
                    name: "time",
                    description: "the duration of the sentence.",
                    type: 4,
                    required: true
                },
                {
                    name: "record",
                    description: "Is this considered a serious offense?",
                    type: 5,
                    required: true
                },
                {
                    name: "reasoning",
                    description: "What did the offender violated?",
                    type: 3,
                    required: true
                },
            ]
        });
    }

    async run(msg, args) {
        msg.reply("dank memes");
    }

}

module.exports = Mute;