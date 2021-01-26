module.exports = {

    help: {
        usage: "!help <command>",
        description: "Helps displays information about a requested command.",
        execute: (client, message, db, args) => {
            if (args[0]) {
                const commands = client.commands[args[0]];
                if (commands) {
                    const usage = commands?.usage;
                    const description = commands?.description;
                    message.reply(usage);
                    message.reply(description);
                }
            }
        }
    },
}