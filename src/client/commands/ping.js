const Command = require("../models/Command");

class Ping extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Checks if the commands are working.",
            userPermission: "MANAGE_ROLES",
            options: null
        });
    }

    async run(msg, args) {
        msg.reply("dank memes");
    }

}

module.exports = Ping;