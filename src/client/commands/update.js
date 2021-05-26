const Command = require("../models/command");
const Message = require("../models/message");
const { groupAPI } = require("../utils/axios");
const { Discord } = require("../utils/discord");
const rbxAPI = require("../utils/robloxAPI");
const clearance = require("../utils/clearance");

class Update extends Command {
    constructor(client) {
        super(client, {
            channelOnly: false,
            description: "Allows you to update your clan ranking and username if changed.",
            permissions: clearance.normal,
            public: false,
            verifyRequired: true,
            args: null,
            cooldown: 10
        });
    }

    async run(interaction, args, user) {
        const userDb = user.document;
        const userId = userDb.data.userId;
        const username = await rbxAPI.getUsernameByUserId(userId);
        // All the groups the user is currently in.
        const groups = await rbxAPI.getGroupsByUserId(userId); 
        // returns all allies groupId
        const clanList = await rbxAPI.getAlliesGroupId();
        let userClans = groups.filter(clan => clanList.some(groupId => groupId === clan.group.id));
        const numOfGroups = userClans.length;

        if (numOfGroups < 1) {
            // also removes any unrelated ranks from the user.
            await Discord.addUserRoleByName(user.id, clearance.normal[0]);
            await Discord.setDisplayName(user.id, username);
            await userDb.update({
                primary_clan: null
            });
            
        } else {
            const primaryGroup = groups.find(clan => clan.group.id == userDb.data.primary_clan) || userClans[0];
            const rank = primaryGroup.role.rank;
            if (rank == 255) { // Faction Leader
                await Discord.addUserRoleByName(user.id, clearance.normal[3]);
            } else if (rank >= 225 && rank < 255) { // Faction Official
                await Discord.addUserRoleByName(user.id, clearance.normal[2]);
            } else { // Faction Member
                await Discord.addUserRoleByName(user.id, clearance.normal[1]);
            }
            await Discord.setDisplayName(user.id, username, primaryGroup);
            await userDb.update({
                primary_clan: primaryGroup.group.id
            });
        }

        throw {
            title: "Successfully Updated",
            message: username
        }
    }

}

module.exports = Update;