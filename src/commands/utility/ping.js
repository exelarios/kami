const Command = require("../Command");

class Ping extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true
        });
    }

    async run(msg, args) {
        msg.reply("dank memes");
    }

}

module.exports = Ping;