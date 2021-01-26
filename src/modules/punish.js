module.exports = {

    punish: {
        usage: "!punish <user> <hours>",
        description: "Punish a member within the community for violating our terms of conditions.",
        execute: (client, message, db, args) => {
            message.reply("punish working");
        }
    },
    
    unpunish: {
        usage: "!unpunish <user>"
    }
}