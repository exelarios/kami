const db = require("../../server/utils/firebase");
const { Discord } = require("../utils/discord");
const User = require("./User");
const embeds = require("../utils/embeds");
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

    async reply(interaction, options) {
        this.client.api.interactions(interaction.id, interaction.token).callback.post({
            data: options
        });
    }

    async execute(interaction, args) {
        try {
            // if (!await this.hasPermission(msg)) return;
            const authorId = interaction.member.user.id;
            const user = await new User(authorId);
            // if (user.isMuted()) {
            //     msg.reply("You aren't allowed to use this command at this time. Try again later.");
            //     return;
            // }
            return await this.run(interaction, args, user);
        } catch(error) {
            if (typeof error == "object") {
                this.onMessage(interaction, {
                    data: {
                        type: 4,
                        data: await Discord.createAPIMessage(interaction, embeds.message({
                            title: error.title,
                            message: error.message
                        }))
                    }
                })            
            } else {
                console.log("2");
                this.onMessage(interaction, {
                    data: {
                        type: 4,
                        data: await Discord.createAPIMessage(interaction, embeds.message({
                            title: "Unexpected Exception",
                            message: error.message
                        }))
                    }
                })            
            }
        }
    }
}

module.exports = Command;