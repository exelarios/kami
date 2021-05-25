const Command = require("../models/command");
const Message = require("../models/message");
const Slash = require("../models/slash");
const { Discord } = require("../utils/discord");

class Ping extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Checks if the commands are working.",
            permissions: ["Moderator", "Administrator"],
            verifiedRequired: false,
            public: false,
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
                const instance = this.client.commands[command.name];
                await slash.editCommand({
                    "name": command.name,
                    "description": instance.description,
                    "options": instance?.args,
                    "default_permission": cmdInfo?.public
                }, command.id);

                if (!instance.public && instance.permissions != undefined) {
                    let permissions = [];
                    for (let permission of instance.permissions) {
                        const roleId = await Discord.getRoleByName(permission);
                        permissions.push({
                            "id": roleId.toString(),
                            "type": 1,
                            "permission": true
                        })
                    }

                    await slash.editPermissions(permissions, process.env.GUILDID, command.id);
                }

                throw new Message(`Updating ${command.name} Command`, "ok");
            } else {
                throw new Message("Invalid parameters", `"Failed to find ${commandName} Command`);
            }
        }

        throw new Message("Ping", `This bot is currently running on version: ${this.client.version}`);

    }

}

module.exports = Ping;