const Command = require("../models/command");
const clearance = require("../utils/clearance");
const Message = require("../models/message");
const rbxAPI = require("../utils/robloxAPI");
const GroupDb = require("../models/group");

class Group extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "change information about a certain group.",
            verifyRequired: false,
            permissions: clearance.admin,
            public: false,
            args: [
                {
                    "name": "groupid",
                    "description": "the group you want to change it's properties.",
                    "required": true,
                    "type": 4, // Number
                },
                {
                    "name": "displayname",
                    "description": "change how the group name is going to be shown.",
                    "required": false,
                    "type": 3, // String
                }
            ]
        });
    }

    async run(interaction, args) {
        // discord's api doesn't allow uppercase letters.
        const { groupid: groupId, displayname: displayName } = args;
        const clanList = await rbxAPI.getAlliesGroupId();
        const targetGroup = clanList.find(clanId => clanId == groupId);
        if (!targetGroup)
            throw new Message("InvalidInputException", "Failed to find a group with the assiociated groupId.")

        let groupDb = this.client.groups[targetGroup];
        if (!groupDb) {
            this.client.groups[targetGroup] = await new GroupDb(targetGroup.toString());
            groupDb = this.client.groups[targetGroup];
        }

        if (!groupDb.exists) {
            await groupDb.create(displayName);
        }

        if (displayName) {
            await groupDb.update({
                displayName: displayName
            });
        }
        throw new Message("Update Group Information", "updating");
    }

}

module.exports = Group;