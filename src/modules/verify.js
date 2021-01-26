const { mainAPI, userAPI } = require("../util/axios");
const { v4: uuidv4 } = require('uuid');

const GROUP_ID = 7887814;

const clanList = [];
const clanIds = [];

const formattedClanNames = {
    "Minamoto Clan ﾀ": "Minamoto",
    "The Sōma Clan": "Sōma",
    "Matsumae clan": "Matsumae",
    "Ōuchi shi": "Ōuchi",
    "Odаᅠ": "Oda",
    "Kabukimono | 一軒家": "Kabukimono",
    "• Iga-ryū • 伊賀流": "Iga-ryū",
    "Hattori Clan": "Hattori",
    "勝元家 | Katsumoto-Ka | 勝元家": "Katsumoto",
    "Ishiyama Hongan-ji Temple": "Ishiyama",
    "Thogoku Clan": "Thogoku",
    "Iezusu-kai": "Iezusu",
    "Daiju-ji": "Daiji",
    "Toyotomi Clan | 豊臣氏": "Toyotomi",
    "Date | 日付": "Date",
    "Nakamura's Gang 中村": "Nakamura",
    "Uesugiᅠ": "Uesugi",
    "Ōtomo Clanᅠ": "Ōtomo",
    "Shimazu Clan": "Shimazu",
    "Hōjō-shi": "Hōjō",
    "Azai Clan | Kiskaddon Family": "Azai",
    "Imagawa-shi": "Imagawa",
    "Mori Clan 森": "Mori"
};

const getAllClans = async () => {
    let isFinalPage = false;
    let currentPage = 0;
    while (!isFinalPage) {
        currentPage++;
        const response = await mainAPI.get(`/groups/${GROUP_ID}/allies?page=${currentPage}`);
        const clans = response.data.Groups;
        clans.map(clan => {
            clanList.push(clan);
            clanIds.push(clan.Id);
            isFinalPage = response.data.FinalPage;
        })
    }
}

const getUserIdByUsername = async (username) => {
    const response = await mainAPI.get(`users/get-by-username?username=${username}`);
    return response.data.Id;
}

const getUserStatsByUserId = async (userId) => {
    const response = await userAPI.get(`users/${userId}/status`);
    return response.data.status.replace(/\s+/g, '');
}

const getUserGroupsByUserId = async (userId) => {
    const response = await mainAPI.get(`users/${userId}/groups`);
    return response.data;
}

const roles = [
    "Faction Leader",
    "Clan Official",
    "Clan Member",
    "Commoner"
];

const setMemberRoleByName = async (message, roleName) => {
    const clanMemberRole = await message.guild.roles.cache.find(role => role.name == roleName);
    if (clanMemberRole) {
        message.member.roles.add(clanMemberRole);
        return true;
    } else {
        message.reply("I couldn't find the role. Please make sure you ask the moderator to make sure everything is spelt correctly.");
    } 
    return false;
}

const removeMemberRoleByName = async (message, roleName) => {
    const clanMemberRole = await message.guild.roles.cache.find(role => role.name == roleName);
    if (clanMemberRole) {
        message.member.roles.remove(clanMemberRole);
        return true;
    } else {
        message.reply(`I couldn't find the ${roleName}. Please make sure you ask the moderator to make sure everything is spelt correctly.`);
    } 
    return false;
}

const removeAllObtainableRole = (message) => {
    const fetchAllRoles = roles.map(role => {
        removeMemberRoleByName(message, role);
    })
    return fetchAllRoles;
}

getAllClans();

module.exports = {
    verify: {
        usage: "!verify <username>",
        description: "To verify new users to the community.",
        execute: async (client, message, db, args) => {

            const users = db.ref("/users");
            const authorId = message.author.id;

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            users.child(authorId).once("value", async (snapshot) => {

                if (args[0] == undefined) {
                    if (!snapshot.val()) {
                        message.reply(
                            "You aren't recorded in our database, provide your Roblox's username as the second argument: `!verify <username>`\n" +
                            "Once you have verfied type `!verify` once again without any arguments."
                        );
                    } else {
                        const userId = snapshot.val().userId;
                        const username = snapshot.val().rbx_username;
                        const userStatus = await getUserStatsByUserId(userId);
                        if (userStatus == snapshot.val().verify_key) {
                            // User has been verified.
                            const userGroups = await getUserGroupsByUserId(userId);
                            const userClans = userGroups.filter(element => clanIds.includes(element.Id));
                            // message.reply("Congrats, you have now been verified.");
                            if (userClans.length <= 1) { // If user has one or less than one group.
                                const clan = userClans[0];
                                if (clan) {
                                    const clanName = formattedClanNames[clan.Name] || clan.Name;
                                    const nickname = `\[${clanName}\] ${clan.Role.split(" ")[0]} | ${username}`;
                                    users.child(authorId).update({
                                        primary_clan: {
                                            Name: clanName,
                                            Id: clan.Id,
                                            Rank: clan.Rank,
                                            Role: clan.Role,
                                            verify: true
                                        }
                                    });
                                    message.member.setNickname(nickname.slice(0, 32))
                                        .catch (error => {
                                            message.reply("Couldn't set Nickname, might be lacking permissions");
                                        })
                                } else {
                                    // if user isn't a member of any clan.
                                    const nickname = `\[Commoner\] | ${username}`;
                                    message.member.setNickname(nickname.slice(0, 32))
                                        .catch (error => {
                                            message.reply("Couldn't set Nickname, might be lacking permissions");
                                        })
                                    const setCommomer = await setMemberRoleByName(message, "Commoner");
                                    if (setCommomer) {
                                        console.log("Commoner");
                                    }
                                }
                            } else {
                                // If you're in muitple clans.
                                const clanListing = userClans.map((clan, index) => {
                                    let output = "";
                                    output += "[" + (index + 1) + "] "+ (formattedClanNames[clan.Name] || clan.Name);
                                    return output;
                                })
                                message.channel.send("Please enter the number corresponding to the clan you want to represent.\n");
                                message.channel.send(clanListing);
                                try {
                                    const filter = msg => msg.author.id === message.author.id;
                                    const response = await message.channel.awaitMessages(filter, {max: 1, time: 10000, errors: ["time", "max"]});
                                    const clanChoice = userClans[response.first().content - 1];
                                    if (clanChoice) {
                                        const clanName = formattedClanNames[clanChoice.Name] || clanChoice.Name;
                                        const nickname = `\[${clanName}\] ${clanChoice.Role.split(" ")[0]} | ${username}`;
                                        message.member.setNickname(nickname.slice(0, 32))
                                            .catch (error => {
                                                message.reply("Couldn't set Nickname, might be lacking permissions");
                                            })
                                        users.child(authorId).update({
                                            primary_clan: {
                                                Name: clanName,
                                                Id: clanChoice.Id,
                                                Rank: clanChoice.Rank,
                                                Role: clanChoice.Role
                                            },
                                            verify: true
                                        });
                                        const removeRole = await removeAllObtainableRole(message);
                                        if (!removeRole) {
                                            message.reply("Please try again, if this prompt shows up again. Please contact a moderator.");
                                            return;
                                        }
                                        if (clanChoice.Rank) {
                                            if (clanChoice.Rank == 255) { // Faction Leader
                                                const setLeader = await setMemberRoleByName(message, "Faction Leader");
                                                if (!setLeader) {
                                                    message.reply("Failed to role you to Faction Leader, please ping a moderator.");
                                                }
                                            } else if (clanChoice.Rank >= 225 && clanChoice.Rank < 255) { // Clan Official
                                                const setOfficial = await setMemberRoleByName(message, "Clan Official");
                                                if (!setOfficial) {
                                                    message.reply("Failed to role you to Clan Official, please ping a moderator.");
                                                }
                                            } else {
                                                const setMember = await setMemberRoleByName(message, "Clan Member");
                                                if (!setMember) {
                                                    message.reply("Failed to role you to Clan Member, please ping a moderator.");
                                                }
                                            }
                                        }
                                    } else {
                                        message.reply("Please input an vaild number corresponding to the clan name. You may retry by typing `!verify`");
                                    }
                                } catch (error) {
                                    message.reply("Unfortunately, you didn't response within the limit. If you responded but the system didn't catch it, please report it to a moderator.");
                                }
                            }
                        } else {
                            message.reply(`${snapshot.val().rbx_username}'s status doesn't match the provided key. Please add the code provided to you and set it as your Roblox's user status.`);
                        }
                    }
                } else {
                    if (!snapshot.val()) {
                    // If they aren't within the database, it will create a profile for the member.
                        const userCode = uuidv4();
                        const rbx_userId = await getUserIdByUsername(args[0]);
                        users.child(authorId).update({
                            verify: false,
                            rbx_username: args[0],
                            verify_key: userCode,
                            userId: rbx_userId,
                            primary_clan: null
                        })
                        client.users.cache.get(authorId).send(`In order to verify you're actually ${args[0]}. Please add \`${userCode}\` onto your update status via Roblox.\nOnce you have done so\, type \`!verify\``);
                    } else {
                    // If they try to verify again without verifying yet.
                        client.users.cache.get(authorId).send(`There's still a pending verifciation under ${snapshot.val().rbx_username}. If you want to change roblox account, please use \`!reverify <username>\``);
                    }
                }
            })
        }
    },
    
    reverify: {
        usage: "!reverify <username>",
        description: "To reverify your social status, clan rank or change roblox username.",
        execute: async (client, message, db, args) => {
            if (args[0] == undefined) {
                const users = db.ref("/users");
                const authorId = message.author.id;
                const userCode = uuidv4();
                const rbx_userId = await getUserIdByUsername(args[0]);
                users.child(authorId).update({
                    verify: false,
                    rbx_username: args[0],
                    verify_key: userCode,
                    userId: rbx_userId
                })
                client.users.cache.get(authorId).send(`In order to verify you're actually ${args[0]}. Please add \`${userCode}\` onto your update status via Roblox.\nOnce you have done so\, type \`!verify\``);
            }
        }
    },

    remove: {
        usage: "!reverify <username>",
        description: "To reverify your social status, clan rank or change roblox username.",
        execute: async (client, message, db, args) => {
            const removeRole = await removeAllObtainableRole(message);
            if (removeRole) {
                console.log("successfully removed role");
            } else {
                console.log("error");
            }
        }
    },

    clans: {
        usage: "!clans",
        description: "dank memes",
        execute: async (client, message, db, args) => {
            let result = [];
            clanList.map((clan) => {
                let formattedName = clan.Name;
                result.push(formattedClanNames[formattedName] || formattedName);
            })
            message.reply(result);
        }
    }
}