const db = require("../../server/utils/firebase");
const { Discord } = require("../utils/discord");
const User = require("./user");
const embeds = require("../utils/embeds");
class Command {

    constructor(client, props) {
        this.client = client;
        this.db = db;
        this.permissions = props.permissions;
        this.description = props.description;
        this.public = props.public;
        this.verifyRequired = props.verifyRequired
        this.channelOnly = props.channelOnly ? true : false;
        this.cooldown = props.cooldown || 5;
        this.args = props.args;
    }

    hasCooldown(interaction) {
        const userId = interaction.member.user.id;
        const user = this.client.users.fetch(userId);
        const lastTimeStamp = user?.lastMessageTimestamp;
        const currentTime = Math.floor(new Date().getTime() / 1000);
        if ((currentTime - lastTimeStamp?.time) < this.cooldown) {
            if (!lastTimeStamp.warned) {
                lastTimeStamp.warned = true;
                this.reply(interaction, {
                    type: 4,
                    data: {
                        content: `You are invoking commands to quick. Please wait ${this.cooldown} seconds before trying again.`
                    }
                })
            }
            return true;
        }
        user.lastMessageTimestamp = {
            time: Math.floor(new Date().getTime() / 1000),
            warned: false
        };
        return false;
    }

    async hasPermission(interaction) {
        if (interaction.member == undefined) {
            this.reply(interaction, {
                type: 4,
                data: {
                    content: "Please try to run the command again within a server."
                }
            })
            return false;
        }
        if (this.hasCooldown(interaction)) return false;
        // if (msg.channel.type != "dm" && !msg.member.hasPermission(this.userPermission)) {
        //     msg.reply("You do not have permissions to run this command.");
        //     return false;
        // }
        return true;
    }

    async reply(interaction, options) {
        this.client.api.interactions(interaction.id, interaction.token).callback.post({
            data: options
        });
    }

    async execute(interaction, args) {
        try {
            if (!await this.hasPermission(interaction)) return;
            // If "member" doesn't exist; this means it's called inside of direct message.
            const authorId = interaction.member.user.id;
            const user = await new User(authorId);
            // if (user.isMuted()) {
            //     msg.reply("You aren't allowed to use this command at this time. Try again later.");
            //     return;
            // }
            return await this.run(interaction, args, user);
        } catch(error) {
            if (error instanceof Error) {
                console.log(error);
                await this.reply(interaction, {
                    type: 4,
                    data: await Discord.createAPIMessage(interaction, embeds.message({
                        title: "Unexpected Exception",
                        message: error.message
                    }))
                });
            } else {
                await this.reply(interaction, {
                    type: 4,
                    data: await Discord.createAPIMessage(interaction, embeds.message({
                        title: error.title,
                        message: error.message
                    }))
                })            
            }
        }
    }
}

module.exports = Command;