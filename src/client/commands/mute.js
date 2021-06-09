const Command = require("../models/command");
const clearance = require("../utils/clearance");
const { Discord } = require("../utils/discord");
const Message = require("../models/message");
const Collection = require("../../shared/collection");

class Mute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Punish a member for a certain amount of time.",
            verifyRequired: false,
            permissions: clearance.admin,
            public: false,
            args: [
                {
                    "name": "offender",
                    "description": "the user that convicted a violated offense.",
                    "type": 6,
                    required: true
                },
                {
                    "name": "time",
                    "description": "the duration of the sentence.",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "record",
                    "description": "Is this considered a serious offense?",
                    "type": 5,
                    "required": true
                },
                {
                    "name": "reasoning",
                    "description": "What did the offender violated?",
                    "type": 3,
                    "required": true
                },
            ]
        });
        this.strikes = 5
        this.days = 30 // Amount of days the violations will be recorded.
    }

    async mute(args, user) {
        const { offender: offenderId, time, record, reasoning } = args;

        const guild = await this.client.guilds.fetch(process.env.GUILD_ID);
        const offender = await guild.members.fetch(offenderId);
        const currentTime = new Date().getTime() / 1000;
        const sentence = 3600 * time;
        const releaseTime = Math.floor(currentTime) + sentence;
        const document = new Collection("users", offenderId);
        const doesExist = await document.exists();

        const onRecordTime = Math.floor(currentTime + (this.days * 24 * 3600));

        const muteChannel = guild.channels.cache.find(channel => channel.name == "punish-log");
        if (!muteChannel) throw new Error("Failed to find `punish-log` channel.");

        if (!doesExist) {
            await document.create({
                punish: releaseTime,
                violation: record ? 1 : 0,
                clearAt: onRecordTime
            });
        } else {
            const snapshot = await document.data();
            // Checks if the user has already been muted.
            if (snapshot?.punish > 0) {
                throw new Message("Violation Report", "The offender is already muted.");
            }
            const violations = snapshot?.violation || 0;
            let onRecord = record ? violations + 1 : violations;

            if (snapshot?.clearAt > currentTime && onRecord >= this.strikes) {
                // Bans the user and clears their violations.
                await document.update({
                    punish: 0,
                    violation: 0,
                    clearAt: 0
                });
                await offender.ban({
                    reason: "Exceeded too much violations."
                });

                const report = new Discord.MessageEmbed()
                    .setAuthor("Banned Successfully Filed", "https://i.imgur.com/lyyexpK.gif")
                    .addFields(
                        { 
                            name: offender.nickname || offender.user.username, 
                            value: "has been permanently banned for violating our server guidelines."
                        }
                    )
                    .setTimestamp();
                muteChannel.send(report);
                return;
            }

            if (snapshot?.clearAt < currentTime) {
                onRecord = record ? 1 : 0;
            }

            const clearTime = snapshot?.clearAt > currentTime ? snapshot?.clearAt : onRecordTime;
            await document.update({
                punish: releaseTime,
                violation: onRecord,
                clearAt: clearTime
            });
        }

        await Discord.addUserRoleByName(offenderId, clearance.none[0]);

        const report = new Discord.MessageEmbed()
            .setTitle(offender.nickname || offender.user.username)
            .setAuthor("Violation Report", "https://i.imgur.com/lyyexpK.gif")
            .setThumbnail(offender.user.displayAvatarURL())
            .addField("Username", `${offender.user.username}#${offender.user.discriminator}`, true)
            .addField("Sentence", `${time} hours`, true)
            .addFields(
                {name: "Reasoning", value: reasoning},
                {name: "Release Time", value: Discord.getReadableTime(releaseTime)},
                {name: "Filed by", value: `${user.username}#${user.discriminator}`}
            )
            .setTimestamp();
        muteChannel.send(report);

        const output = new Discord.MessageEmbed()
            .setAuthor("Violation Successfully Filed", "https://i.imgur.com/lyyexpK.gif")
            .addFields(
                { 
                    name: offender.nickname || offender.user.username, 
                    value: "has been temporary muted for violating our server guidelines."
                }
            );
        
        return output;
    }

    async onBlacklisted(message) {
        let banned = this.client.bannedWords;
        for(let i = 0; i < banned.length; i++) {
            let msg = message.content.toLowerCase();
            if (msg.includes(banned[i])) {
                try {
                    const output = await this.mute({
                        offender: message.author.id,
                        time: 24,
                        record: true,
                        reasoning: "Inapporiate rhetoric."
                    }, message.author);
                    message.channel.send(output);
                } catch(error) {
                    console.error(error);
                }
                return;
            }
        }
    }

    async memberAdded(member) {
        const memberId = member.user.id;
        const document = new Collection("users", memberId);
        const doesExist = document.exists();
        if (!doesExist) return;
        const snapshot = await document.data();
        const currentTime = new Date().getTime() / 1000;
        if (snapshot?.punish > currentTime) {
            await Discord.addUserRoleByName(memberId, "Punished");
            return;
        }
    }

    async run(interaction, args, user) {
        const output = await this.mute(args, user);
        this.reply(interaction, {
            type: 4,
            data: await Discord.createAPIMessage(interaction, output)
        });
    }

}

module.exports = Mute;