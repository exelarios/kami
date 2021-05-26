const Command = require("../models/command");
const Message = require("../models/message");
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

        let newNickname = "";
        let newRole = "";

        if (numOfGroups < 1) {
            // also removes any unrelated ranks from the user.
            newRole = await Discord.addUserRoleByName(user.id, clearance.normal[0]);
            newNickname = await Discord.setDisplayName(user.id, username);
            await userDb.update({
                primary_clan: null
            });
            
        } else {
            const primaryGroup = groups.find(clan => clan.group.id == userDb.data.primary_clan) || userClans[0];
            const rank = primaryGroup.role.rank;
            if (rank == 255) { // Faction Leader
                newRole = await Discord.addUserRoleByName(user.id, clearance.normal[3]);
            } else if (rank >= 225 && rank < 255) { // Faction Official
                newRole = await Discord.addUserRoleByName(user.id, clearance.normal[2]);
            } else { // Faction Member
                newRole = await Discord.addUserRoleByName(user.id, clearance.normal[1]);
            }
            newNickname = await Discord.setDisplayName(user.id, username, primaryGroup);
            await userDb.update({
                primary_clan: primaryGroup.group.id
            });
        }

        const output = new Discord.MessageEmbed()
            .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
            .addFields(
                { name: "Nickname", value: newNickname},
                { name: "Role", value: newRole}
            )

        this.reply(interaction, {
            type: 4,
            data: await Discord.createAPIMessage(interaction, output)
        });
    }

}

module.exports = Update;