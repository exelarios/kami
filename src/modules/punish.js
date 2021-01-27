
function combineArrayAtIndex(args, starting) {
    let result = "";
    for (let i = starting; i < args.length; i++) {
        result += args[i] + " ";
    }
    return result;
}

// todo:
// If member doesn't have a profile, then it create a blank for them.

module.exports = {

    punish: {
        usage: "!punish <user> <hours> <reasoning>",
        description: "Punish a member within the community for violating our terms of conditions.",
        execute: (client, message, db, args) => {
            if (!message.member.hasPermission("KICK_MEMBERS")) {
                message.reply("You lack permissions you execute this command.");
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
                    violator.roles.add(getPunishedRole);
                    message.reply("in");
                }
            } else {
                message.reply("Failed to get mentioned member.");
            }
        }
    },
    
    unpunish: {
        usage: "!unpunish <user>",
        description: "Unpunish a member within the community for violating our terms of conditions.",
        execute: (client, message, db, args) => {
            if (!message.member.hasPermission("KICK_MEMBERS")) {
                message.reply("You lack permissions you execute this command.");
                return;
            }
        }
    }
}