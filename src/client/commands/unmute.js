const Command = require("../models/command");
const clearance = require("../utils/clearance");
const Message = require("../models/message");
const { Discord } = require("../utils/discord");
const Collection = require("../../shared/collection");

class Unmute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Umutes an offender from being muted.",
            verifyRequired: false,
            permissions: clearance.admin,
            public: false,
            args: [
                {
                    "name": "offender",
                    "description": "the offender you want to unmute",
                    "required": true,
                    "type": 6, // User
                },
                {
                    "name": "reasoning",
                    "description": "the reason why you're letting the offender go.",
                    "required": true,
                    "type": 3, // String
                }
            ]
        });
    }

    async release() {
        const guild = await this.client.guilds.fetch(process.env.GUILD_ID);
        if (!guild) throw new Error("Failed to find guild.");
        const muteLog = guild.channels.cache.find(channel => channel.name == "punish-log");
        const muteRole = guild.roles.cache.find(role => role.name == clearance.none[0]);
        if (!muteRole) {
            muteLog.send("Release Feature failed to find Punished role.");
            return;
        }
        setInterval(function() {
            muteRole.members.map(async (member) => {
                const memberId = member.user.id;
                const document = new Collection("users", memberId);
                const doesExist = await document.exists();
                if (doesExist) {
                    const currentTime = new Date().getTime() / 1000;
                    const snapshot = await document.data();
                    if (snapshot?.punish <= Math.floor(currentTime)) {
                        await Discord.removeUserRoleByName(memberId, clearance.none[0]);
                        await document.update({
                            punish: 0
                        });
                        const releaseReport = new Discord.MessageEmbed()
                            .setAuthor("Release Report")
                            .setThumbnail(member.user.displayAvatarURL())
                            .setDescription(`${member.nickname || member.user.username}(${member.user.username}#${member.user.discriminator}) has unmuted at ${Discord.getReadableTime(currentTime)}.`);
                        muteLog.send(releaseReport);
                    }
                }
            });
        }, process.env.INTERVAL);
    }

    async run(interaction, args, user) {
        const { offender: offenderId, reasoning } = args;

        const offenderDoc = new Collection("Users", offenderId);
        if (!await offenderDoc.exists())
            throw new Message("Invalid Offender", "The user you want to unmute doesn't seem to exist within our records.");

        await offenderDoc.update({
            punished: 0
        });
        await Discord.removeUserRoleByName(offenderId, clearance.none[0]);

        const guild = await this.client.guilds.fetch(process.env.GUILD_ID);
        const offender = await guild.members.fetch(offenderId);
        const muteChannel = guild.channels.cache.find(channel => channel.name == "punish-log");
        if (!muteChannel) throw new Error("Failed to find `punish-log` channel.");

        const currentTime = new Date().getTime() / 1000;

        const report = new Discord.MessageEmbed()
            .setTitle(offender.nickname || offender.user.username)
            .setAuthor("Release Report", "https://i.imgur.com/lyyexpK.gif")
            .setThumbnail(offender.user.displayAvatarURL())
            .addFields(
                {
                    name: "Reasoning",
                    value: reasoning
                },
                {
                    name: "Time of Release",
                    value: Discord.getReadableTime(currentTime)
                },
                {
                    name: "Release By",
                    value: user.nickname || user.username
                }
            )
            .setTimestamp();
        muteChannel.send(report);

        const output = new Discord.MessageEmbed()
            .setAuthor("Release Offender", "https://i.imgur.com/lyyexpK.gif")
            .addFields(
                { 
                    name: offender.nickname || offender.user.username, 
                    value: `has been mannually unmuted.`
                }
            )

        this.reply(interaction, {
            type: 4,
            data: await Discord.createAPIMessage(interaction, output)
        });
    }

}

module.exports = Unmute;