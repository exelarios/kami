module.exports = {

    punish: {
        usage: "!punish <user> <hours>",
        description: "Punish a member within the community for violating our terms of conditions.",
        execute: (client, message, db, args) => {
            message.reply("tora is gay!");
        }
    },
    
    unpunish: {
        usage: "!unpunish <user>"
    }
}