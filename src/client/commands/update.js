const Command = require("../models/Command");

class Update extends Command {
    constructor(client) {
        super(client, {
            channelOnly: false,
            description: "Allows you to update your clan ranking and username if changed.",
            args: null
        });
    }

    async run(msg, args) {
        msg.reply("dank memes");
    }

}

module.exports = Update;