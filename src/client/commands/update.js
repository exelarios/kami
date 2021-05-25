const Command = require("../models/command");

class Update extends Command {
    constructor(client) {
        super(client, {
            channelOnly: false,
            description: "Allows you to update your clan ranking and username if changed.",
            private: false,
            args: null
        });
    }

    async run(interaction, args, users) {
        
        throw {
            title: "Update",
            message: "dank memes"
        }
    }

}

module.exports = Update;