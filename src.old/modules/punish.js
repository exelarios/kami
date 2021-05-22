const Discord = require("discord.js");
const { roles } = require("../util/titles");
const util = require("../../src/util/shared");
const blacklist = require("../../src/util/blacklist");
const discordAPI = require("../../src/util/discordAPI");

function combineArrayAtIndex(args, starting) {
    let result = "";
    for (let i = starting; i < args.length; i++) {
        result += args[i] + " ";
    }
    return result;
}

const commands = [
    {
        usage: "!punish <user> <hours> <reasoning>",
        description: "Punish a member within the community for violating our terms of conditions.",
        access: "MANAGE_ROlES",
        execute: async (client, message, db, args, isBot) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            if (!isBot && !message.member.hasPermission("MANAGE_ROLES")) {
                message.reply("You lack permissions you execute this command.")
                    .then(reply => {
                        reply.delete({ timeout: 5000 })
                            .catch(console.error);
                    });
                return;
            }

            if (!args[0] || !args[1] || !args[2] || !args[1].match(/^\d+$/)) {
                message.reply("Missing arguments or incorrect formatting. Please make sure you include the mention of the member and the duration of the detainment.")
                return;
            }

            const reasoning = combineArrayAtIndex(args, 2);
            const target = isBot ? args[0] : message.mentions.users.first();
            if (target) {
                const violator = message.guild.members.cache.get(target.id);
                if (violator) {
                    const getPunishedRole = message.guild.roles.cache.find(role => role.name == "Punished");
                    if (getPunishedRole) {
                        const users = db.collection("users");
                        const user = users.doc(violator.user.id);
                        const modLogChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === "punish-log");
                        if (!modLogChannel) {
                            message.reply("Failed to find punish-log");
                        }
                        const currentTime = new Date().getTime() / 1000;
                        const punishTime = 3600 * args[1];
                        const releaseTime = util.getReadableTime(Math.floor(currentTime) + punishTime);
                        const receiptEmbed = new Discord.MessageEmbed()
                            .setTitle(violator.nickname || violator.user.username)
                            .setAuthor("Violation Report")
                            .setThumbnail(violator.user.displayAvatarURL())
                            .addField("Username", `${violator.user.username}#${violator.user.discriminator}`, true)
                            .addField("Sentence", `${args[1]} hours`, true)
                            .addFields(
                                {name: "Reasoning", value: reasoning},
                                {name: "Release Time", value: releaseTime},
                                {name: "Filed by", value: `${message.author.username}#${message.author.discriminator}`}
                            )
                            .setTimestamp();
                        modLogChannel.send(receiptEmbed);
                        try {
                            violator.user.send(receiptEmbed);
                        } catch {
                            modLogChannel.send(`Failed to send a copy of Violation Report to ${violator.user.username}#${violator.user.discriminator}. Direct Message might be disabled.`);
                        }
                        discordAPI.removeAllMemberObtainableRole(violator);
                        const addPunishRole = violator.roles.add(getPunishedRole);
                        if (!addPunishRole) {
                            message.reply("Failed to add `Punished` to violator.")
                        }
                        await user.update({
                            punish: Math.floor(currentTime) + punishTime
                        })
                    }
                }
                message.author.lastMessage?.delete({timeout: 6000});
            } else {
                message.reply("Failed to get mentioned member.");
            }
        }
    },

    {
        usage: "!unpunish <user> <reasoning>",
        description: "Unpunish a member within the community for violating our terms of conditions.",
        access: "MANAGE_ROLES",
        execute: async (client, message, db, args, isBot) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            if (!isBot && !message.member.hasPermission("MANAGE_ROLES")) {
                message.reply("You lack permissions you execute this command.")
                    .then(reply => {
                        reply.delete({ timeout: 5000 })
                    })
                    .catch(error => console.error(error));
                return;
            }

            if (!args[0] || !args[1]) {
                message.reply("Missing arguments or incorrect formatting. Please make sure you include the mention of the member and the duration of the detainment.")
                return;
            }
            const reasoning = combineArrayAtIndex(args, 1);
            const target = message.mentions.users.first() || args[0];
            if (target) {
                const users = db.collection("users");
                const violator = message.guild.members.cache.get(target.id);
                if (violator) {
                    const user = await users.doc(target.id).get();
                    const snapshot = user.data();
                    if (!snapshot?.punish) {
                        message.reply("Record doesn't indicate the mentioned member is currently punished.")
                            .then(reply => {
                                reply.delete({ timeout: 5000 })
                            })
                            .catch(error => console.error(error));
                        return;
                    }
                    const punishedRole = message.guild.roles.cache.find(role => role.name == "Punished");
                    if (!punishedRole) {
                        message.reply("Failed to find Punish Role");
                    }
                    const modLogChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === "punish-log");
                    if (!modLogChannel) {
                        message.reply("Failed to find punish-log");
                    }
                    const currentTime = new Date().getTime() / 1000;
                    const releaseTime = util.getReadableTime(Math.floor(currentTime));
                    const releaseReport = new Discord.MessageEmbed()
                        .setAuthor("Release Report")
                        .setThumbnail(violator.user.displayAvatarURL())
                        .addFields(
                            {name: "Reasoning", value: reasoning},
                            {name: "Time Of Release", value: releaseTime},
                            {name: "Released by", value: `${message.author.username}#${message.author.discriminator}`}
                        )
                        .setTimestamp();
                    modLogChannel.send(releaseReport);
                    violator.roles.remove(punishedRole);
                    await users.doc(target.id).update({
                        punish: null,
                    })
                }
                message && message.author.lastMessage.delete({timeout: 6000});
            } else {
                message.reply("Failed to release mentioned member");
            }
        }
    }
]

const actions = {
    releaseOffenders: async (client, db) => {
        const server = client.guilds.cache.find(guild => guild.id == client.SERVER_ID || guild.id == client.TEST_ID);
        if (server) {
            const users = db.collection("users");
            const punishRole = server.roles.cache.find(role => role.name == "Punished");
            if (punishRole) {
                const modLogChannel = server.channels.cache.find(channel => channel.name.toLowerCase() === "punish-log");
                setInterval(function() {
                    punishRole.members.map(async (member) => {
                        const memberId = member.user.id;
                        const user = users.doc(memberId);
                        const doc = await user.get();
                        if (doc.exists) {
                            const data = doc.data();
                            const currentTime = new Date().getTime() / 1000;
                            if (data.punish <= Math.floor(currentTime)) {
                                const releaseReport = new Discord.MessageEmbed()
                                    .setAuthor("Release Report")
                                    .setThumbnail(member.user.displayAvatarURL())
                                    .setDescription(`${member.nickname || member.user.username}(${member.user.username}#${member.user.discriminator}) has been released from punished at ${util.getReadableTime(currentTime)}.`)
                                modLogChannel.send(releaseReport);
                                try {
                                    member.user.send(releaseReport);
                                } catch(error) {
                                    console.error(error);
                                }
                                member.roles.remove(punishRole);
                                users.doc(memberId).update({
                                    punish: null,
                                })
                            }
                        }
                    });
                }, process.env.INTERVAL);
            }
        }
    },
    onMemberAdded: async (client, member, db) => {
        const authorId = member.user.id;
        const users = db.collection("users");
        const user = await users.doc(authorId).get();
        const snapshot = user.data();
        if (!snapshot) return;
        const currentTime = new Date().getTime() / 1000;
        if (snapshot.punish > Math.floor(currentTime)) {
            const getPunishedRole = member.guild.roles.cache.find(role => role.name == "Punished");
            if (getPunishedRole) {
                member.roles.add(getPunishedRole);
            }
        }
    },
    checkBlacklistedWords: (client, message, db) => {
        blacklist.map(word => {
            if (message.content.toLowerCase().includes(word)) {
                const args = [message.author, "24", `Ethnic Slur(s):\n "${message.content}"`];
                client.commands["punish"].execute(client, message, db, args, true);
                return;
            }
        })
    }
}

module.exports = {
    commands,
    actions
}