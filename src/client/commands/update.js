const Command = require("../models/command");

class Update extends Command {
    constructor(client) {
        super(client, {
            channelOnly: false,
            description: "Allows you to update your clan ranking and username if changed.",
            public: true,
            verifiedRequired: true,
            args: null,
            cooldown: 10
        });
    }

    async run(interaction, args, users) {
        /*
        0) Check if they are verified.
            - false: END
        1) Fetch if they are within any allies groups of Gekokujō.
            - false:
                - Remove all obtainable roles
                - Role them Commoner
                - Set Nickname as Commomer with their roblox username.
                - END
        2) Check if they are within more than one group.
            - true:
                - Prompt them to choose a group.
                    - Check if it's necessary to update their roles.
                    - We will update their nickname with their rank and role.
            - false:
                - Check if it's necessary to update their roles.
                - We will update their nickname with their rank and role.
        */

        throw {
            title: "Update",
            message: "dank memes"
        }
    }

}

module.exports = Update;