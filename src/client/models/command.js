const db = require("../../shared/firebase");
const { Discord } = require("../utils/discord");
const embeds = require("../utils/embeds");
const Message = require("./message");
const Collection = require("../../shared/collection");

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

    async hasPermission(interaction, user) {
        // If "member" doesn't exist; this means it's called inside of direct message.
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
            const authorId = interaction.member.user.id;
            const user = await this.client.users.fetch(authorId);
            user.document = new Collection("users", authorId);
            const snapshot = await user.document.data();
            // Checks if the command requires the user to be verified.
            if (!snapshot?.verify && this.verifyRequired)
                throw new Message("Access Denied", "You must be verified in order to run this command.");
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
