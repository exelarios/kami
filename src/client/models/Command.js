const db = require("../../server/utils/firebase");
const Argument = require("./Argument");
const User = require("./User");

class Command {

    constructor(client, props) {
        this.client = client;
        this.db = db;
        this.userPermission = props.userPermission;
        this.description = props.description;
        this.channelOnly = props.channelOnly ? true : false;
        this.cooldown = props.cooldown || 5;
        this.args = props.args;
    }

    hasCooldown(msg) {
        const lastTimeStamp = msg.author?.lastMessageTimestamp;
        const currentTime = Math.floor(new Date().getTime() / 1000);
        if ((currentTime - lastTimeStamp?.time) < this.cooldown) {
            if (!lastTimeStamp.warned) {
                lastTimeStamp.warned = true;
                msg.reply(`You are invoking commands to quick. Please wait ${this.cooldown} seconds before trying again.`);
            }
            return true;
        } else {
            msg.author.lastMessageTimestamp = {
               time: Math.floor(new Date().getTime() / 1000),
               warned: false
            };
            return false;
        }
    }

    onError(error) {
        console.error(error);
    }

    async hasPermission(msg) {
        if (msg.author.bot) return false;
        if ((this.channelOnly == true) && (msg.channel.type == "dm")) {
            msg.reply("This command can only be ran within a server channel.");
            return false;
        };
        if (this.hasCooldown(msg)) return false;
        if (msg.channel.type != "dm" && !msg.member.hasPermission(this.userPermission)) {
            msg.reply("You do not have permissions to run this command.");
            return false;
        }
        return true;
    }

    async execute(interaction, args) {
        if (!await this.hasPermission(msg)) return;
        const authorId = msg.author.id;
        const user = await new User(authorId);
        if (user.isMuted()) {
            msg.reply("You aren't allowed to use this command at this time. Try again later.");
            return;
        }
        return this.run(msg, await this.args.obatin(msg, args), user);
    }
}

module.exports = Command;