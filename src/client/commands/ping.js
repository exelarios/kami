const Command = require("../models/command");
const Slash = require("../models/slash");

class Ping extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Checks if the commands are working.",
            userPermission: "MANAGE_ROLES",
            args: [
                {
                    "name": "command_name",
                    "description": "The name of the command you want to update.",
                    "required": false,
                    "type": 3
                }
            ]
        });
    }

    async run(interaction, args, user) {
        const { command_name: commandName } = args;
        if (commandName) {
            const slash = new Slash(process.env.TOKEN, this.client.user.id);
            const commands = await slash.getCommands();
            const command = commands.filter(command => command.name == commandName.toLowerCase())[0];
            if (command) {
                const cmdInfo = this.client.commands[command.name];
                await slash.editCommand({
                    "name": command.name,
                    "description": cmdInfo.description,
                    "options": cmdInfo?.args
                }, command.id);
                throw {
                    "title": `Updating ${command.name} Command`,
                    "message": "ok"
                }
            } else {
                throw {
                    "title": "Invalid parameters",
                    "message": `Failed to find ${commandName} Command`,
                }
            }
        } else {
            throw {
                title: "Ping",
                message: `This bot is currently running on version: ${this.client.version}`
            }
        }

    }

}

module.exports = Ping;