const Discord = require("discord.js");

module.exports = {

    help: {
        usage: "!help <command>",
        description: "Helps displays information about a requested command.",
        execute: (client, message, db, args) => {
            if (args[0]) {
                const command = client.commands[args[0]];
                if (command) {
                    const embed = new Discord.MessageEmbed()
                        .addFields({
                            name: command.usage,
                            value: command.description
                        })
                    message.reply(embed);
                } else {
                    message.reply("Inputted Command couldn't be found, try \`!commands\`");
                }
            }
        }
    },

    commands: {
        usage: "!commands",
        description: "displays all the commands.",
        execute: (client, message, db) => {
            const listOfCommands = Object.keys(client.commands);
            const fields = [];
            listOfCommands.map((command) => {
                const getCommand = client.commands[command];
                fields.push({
                    name: getCommand.usage,
                    value: getCommand.description
                })
            })

            const embed = new Discord.MessageEmbed()
            .setTitle("List of Commands")
            .addFields(fields);
            message.reply(embed);
        }
    }
}