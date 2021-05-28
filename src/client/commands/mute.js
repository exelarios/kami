const User = require("../models/user");
const Command = require("../models/Command");
const clearance = require("../utils/clearance");
const { Discord } = require("../utils/discord");

function getReadableTime(time) {
    const date = new Date(time * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${month} ${day}, ${year} @ ${hour}:${minutes}:${seconds} UTC`
}
class Mute extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Checks if the commands are working.",
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
    }

    async release(offender) {

    }

    async run(interaction, args, user) {
        const { offender: offenderId, time, record, reasoning } = args;

        const guild = await this.client.guilds.fetch(process.env.GUILDID);
        const offender = await guild.members.fetch(offenderId);
        const currentTime = new Date().getTime() / 1000;
        const sentence = 3600 * time;
        const releaseTime = Math.floor(currentTime) + sentence;
        const offenderDoc = await new User(offenderId);
        if (!offenderDoc.exists) {
            await offenderDoc.create({
                punished: releaseTime,
                violation: record ? 1 : 0
            });
        } else {
            const violations = parseInt(offenderDoc.data?.violation) || 0;
            await offenderDoc.update({
                punished: releaseTime,
                violation: record ? violations + 1 : violations
            });
        }
        await Discord.addUserRoleByName(offenderId, clearance.none[0]);

        const muteChannel = guild.channels.cache.find(channel => channel.name == "punish-log");
        if (!muteChannel) throw new Error("Failed to find `punish-log` channel.");

        const report = new Discord.MessageEmbed()
            .setTitle(offender.nickname || offender.user.username)
            .setAuthor("Violation Report")
            .setThumbnail(offender.user.displayAvatarURL())
            .addField("Username", `${offender.user.username}#${offender.user.discriminator}`, true)
            .addField("Sentence", `${time} hours`, true)
            .addFields(
                {name: "Reasoning", value: reasoning},
                {name: "Release Time", value: getReadableTime(releaseTime)},
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
            )

        this.reply(interaction, {
            type: 4,
            data: await Discord.createAPIMessage(interaction, output)
        });
    }

}

module.exports = Mute;