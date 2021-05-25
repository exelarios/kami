const Command = require("../models/command");

class Censor extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "adds a word onto the blacklist.",
            userPermission: "MANAGE_ROLES",
            private: true,
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
        throw {
            title: "Blacklisted",
            message: word
        }        
    }

}

module.exports = Censor;