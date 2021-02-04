const Discord = require("discord.js");
const { roles } = require("../util/titles");
const util = require("../util/shared");

function combineArrayAtIndex(args, starting) {
    let result = "";
    for (let i = starting; i < args.length; i++) {
        result += args[i] + " ";
    }
    return result;
}

function removeAllMentionObtainableRole(member) {
    roles.map((role) => {
        const clanMemberRole = member.roles.cache.find(memberRole => memberRole.name == role);
        if (clanMemberRole) {
            member.roles.remove(clanMemberRole);
        }
    });
}

module.exports = {

    punish: {
        usage: "!punish <user> <hours> <reasoning>",
        description: "Punish a member within the community for violating our terms of conditions.",
        execute: async (client, message, db, args, isBot) => {
            const users = db.ref("/users");
            const authorId = message.author.id;
            users.child(authorId).once("value", async (snapshot) => {
                if (!isBot && !message.member.hasPermission("MANAGE_ROLES")) {
                    message.reply("You lack permissions you execute this command.")
                        .then(reply => {
                            reply.delete({ timeout: 5000 })
                                .catch(console.error);
                        });
                    return;
                }
                if (snapshot.val() && snapshot.val().punish) {
                    message.delete();
                    return;
                }
                if (!args[0] || !args[1] || !args[2] || !args[1].match(/^\d+$/)) {
                    message.reply("Missing arguments or incorrect formatting. Please make sure you include the mention of the member and the duration of the detainment.")
                    return;
                }
                const reasoning = combineArrayAtIndex(args, 2);
                const target = message.mentions.users.first() || args[0];
                if (target) {
                    const violator = message.guild.members.cache.get(target.id);
                    const getPunishedRole = message.guild.roles.cache.find(role => role.name == "Punished");
                    if (getPunishedRole) {
                        const users = db.ref("/users");
                        const modLogChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === "punish-log");
                        if (!modLogChannel) {
                            message.reply("Failed to find punish-log");
                        }
                        const currentTime = new Date().getTime() / 1000;
                        const punishTime = 3600 * args[1];
                        const receiptEmbed = new Discord.MessageEmbed()
                            .setTitle(violator.nickname || violator.user.username)
                            .setAuthor("Violation Report")
                            .setThumbnail(violator.user.displayAvatarURL())
                            .addField("Username", `${violator.user.username}#${violator.user.discriminator}`, true)
                            .addField("Sentence", `${args[1]} hours`, true)
                            .addFields(
                                {name: "Reasoning", value: reasoning},
                                {name: "Release Time", value: util.getReadableTime(Math.floor(currentTime) + punishTime)},
                                {name: "Filed by", value: `${message.author.username}#${message.author.discriminator}`}
                            )
                            .setTimestamp();
                        modLogChannel.send(receiptEmbed);
                        violator.user.send(receiptEmbed);
                        removeAllMentionObtainableRole(violator);
                        const addPunishRole = violator.roles.add(getPunishedRole);
                        if (!addPunishRole) {
                            message.reply("Failed to add `Punished` to violator.")
                        }
                        users.child(violator.user.id).update({
                            punish: Math.floor(currentTime) + punishTime
                        })
                    }
                    message.author.lastMessage.delete({timeout: 6000});
                } else {
                    message.reply("Failed to get mentioned member.");
                }
            });
        }
    }
}