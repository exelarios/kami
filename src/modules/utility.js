const Discord = require("discord.js");

const commands = [
    {
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
    {
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
    },
    {
        usage: "!version",
        description: "displays the current version.",
        execute: (client, message, db) => {
            message.reply(client.version);
        }
    },
    {
        usage: "!restart",
        description: "restarts the bot.",
        execute: (client, message, db) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            if (!message.member.hasPermission("MANAGE_ROLES")) {
                message.reply("You lack permissions you execute this command.")
                    .then(reply => {
                        reply.delete({ timeout: 5000 })
                    })
                    .catch(error => console.error(error));
                return;
            }

            process.exit(1);
        }
    },
]

const actions = [

]

module.exports = {
    commands,
    actions
}