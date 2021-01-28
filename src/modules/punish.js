const Discord = require("discord.js");
const { roles } = require("../util/titles");

function combineArrayAtIndex(args, starting) {
    let result = "";
    for (let i = starting; i < args.length; i++) {
        result += args[i] + " ";
    }
    return result;
}

async function removeMentionRoleByName(member, roleName) {
    const clanMemberRole = await member.roles.cache.find(role => role.name == roleName);
    if (clanMemberRole) {
        member.roles.remove(clanMemberRole);
        return true;
    }
    return false;
}

function removeAllMentionObtainableRole(member) {
    const fetchAllRoles = roles.map(role => {
        removeMentionRoleByName(member, role);
    })
    return fetchAllRoles;
}

module.exports = {

    punish: {
        usage: "!punish <user> <hours> <reasoning>",
        description: "Punish a member within the community for violating our terms of conditions.",
        execute: async (client, message, db, args) => {
            if (!message.member.hasPermission("MANAGE_ROLES")) {
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
            const target = message.mentions.users.first();
            if (target) {
                const violator = message.guild.members.cache.get(target.id);
                const getPunishedRole = message.guild.roles.cache.find(role => role.name == "Punished");
                if (getPunishedRole) {
                    const users = db.ref("/users");
                    const modLogChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === "mod-log");
                    if (!modLogChannel) {
                        message.reply("Failed to find mod-log");
                    }
                    const receiptEmbed = new Discord.MessageEmbed()
                        .setTitle(violator.nickname)
                        .setAuthor("Violation Report")
                        .setThumbnail(violator.user.displayAvatarURL())
                        .addField("Username", `${violator.user.username}#${violator.user.discriminator}`, true)
                        .addField("Duration", `${args[1]} hours`, true)
                        .addFields(
                            {name: "Reasoning", value: reasoning},
                            {name: "Filed by", value: `${message.author.username}#${message.author.discriminator}`}
                        )
                        .setTimestamp();
                    modLogChannel.send(receiptEmbed);
                    removeAllMentionObtainableRole(violator);
                    const addPunishRole = violator.roles.add(getPunishedRole);
                    if (!addPunishRole) {
                        message.reply("Failed to add `Punished` to violator.")
                    }
                    const currentTime = new Date().getTime();
                    const punishTime = 3600 * args[1];
                    users.child(violator.user.id).update({
                        punish: currentTime + punishTime
                    })
                }
                message.author.lastMessage.delete({timeout: 6000});
            } else {
                message.reply("Failed to get mentioned member.");
            }
        }
    }
}