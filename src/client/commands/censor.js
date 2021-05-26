const Command = require("../models/command");
const { Discord } = require("../utils/discord");
const Message = require("../models/message");
const clearance = require("../utils/clearance");

class Censor extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "adds a word onto the blacklist.",
            verifyRequired: false,
            permissions: clearance.admin,
            public: false,
            args: [
                {
                    "name": "word",
                    "description": "The word you want to have blacklisted.",
                    "required": true,
                    "type": 3,
                }
            ]
        });
    }

    async run(interaction, args) {
        const { word } = args;
        const roleId = await Discord.getRoleByName(word).toString();
        throw new Message("Blacklisted", word);
    }

}

module.exports = Censor;