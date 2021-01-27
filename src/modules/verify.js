const { mainAPI, userAPI } = require("../util/axios");
const { v4: uuidv4 } = require('uuid');
const { clans, roles } = require("../util/titles");

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

const setSocialStatusByGroupRank = async (message, clan) => {
    if (clan.Rank) {
        if (clan.Rank == 255) { // Faction Leader
            const setLeader = await setMemberRoleByName(message, "Faction Leader");
            if (!setLeader) {
                message.reply("Failed to role you to Faction Leader, please ping a moderator.");
            }
        } else if (clan.Rank >= 225 && clan.Rank < 255) { // Clan Official
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
}

const setMemberAsCommomer = async (message, users, username) => {
    const authorId = message.author.id;
    const nickname = `\[Commoner\] ${username}`;
    message.member.setNickname(nickname.slice(0, 32))
        .catch (error => {
            message.reply("Couldn't set Nickname, might be lacking permissions");
        })
    const setCommomer = await setMemberRoleByName(message, "Commoner");
    if (!setCommomer) {
        message.reply("Failed to role you to Commoner, please ping a moderator.");
    }
    users.child(authorId).update({
        primary_clan: null,
        verify: true
    });
}

const requestPrimaryClan = async (message, userStore, userClans, username) => {

    if (userClans.length < 1) {
        removeAllObtainableRole(message);
        setMemberAsCommomer(message, userStore, username);
        return;
    }

    const clanListing = userClans.map((clan, index) => {
        let output = "";
        output += "[" + (index + 1) + "] "+ (clans[clan.Name] || clan.Name);
        return output;
    })
    message.channel.send("Please enter the number corresponding to the clan you want to represent.\n");
    message.channel.send(clanListing);
    const filter = msg => msg.author.id === message.author.id;
    try {
        const getAwaitMessage = await message.channel.awaitMessages(filter, {max: 1, time: 10000, errors: ["time", "max"]});
        if (getAwaitMessage) {
            const clanChoice = userClans[getAwaitMessage.first().content - 1];
            if (clanChoice) {
                const clanName = clans[clanChoice.Name] || clanChoice.Name;
                const nickname = `\[${clanName}\] ${clanChoice.Role.split(" ")[0]} | ${username}`;
                message.member.setNickname(nickname.slice(0, 32))
                    .catch (error => {
                        message.reply("Couldn't set Nickname, might be lacking permissions");
                    })
                userStore.child(message.author.id).update({
                    primary_clan: {
                        Name: clanName,
                        Id: clanChoice.Id,
                        Rank: clanChoice.Rank,
                        Role: clanChoice.Role
                    },
                    verify: true
                });
                removeAllObtainableRole(message);
                setSocialStatusByGroupRank(message, clanChoice);
            } else {
                message.reply("Please input an vaild number corresponding to the clan name. You may retry by typing `!verify`");
            }
        }
    } catch(error) {
        message.reply("Await Response Timeout. You may retry by typing `!verify`")
    }
}

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
                        ).then(reply => {
                            reply.delete({ timeout: 5000 })
                                .catch(console.error);
                        });
                    } else {
                        if (snapshot.val().verify) {
                            message.reply("You are already verified, if you want to change accounts, you may use `!reverify <username>`. If you think this is a mistake please ping a moderator.");
                            return;
                        }
                        const userId = snapshot.val().userId;
                        const username = snapshot.val().rbx_username;
                        const userStatus = await getUserStatsByUserId(userId);

                        if (userStatus == snapshot.val().verify_key) {
                            // User has been verified.
                            const userGroups = await getUserGroupsByUserId(userId);
                            const userClans = userGroups.filter(element => client.clanIds.includes(element.Id));
                            if (userClans.length <= 1) { // If user has one or less than one group.
                                const clan = userClans[0];
                                if (clan) {
                                    const clanName = clans[clan.Name] || clan.Name;
                                    const nickname = `\[${clanName}\] ${clan.Role.split(" ")[0]} | ${username}`;
                                    users.child(authorId).update({
                                        primary_clan: {
                                            Name: clanName,
                                            Id: clan.Id,
                                            Rank: clan.Rank,
                                            Role: clan.Role,
                                        },
                                        verify: true
                                    });
                                    message.member.setNickname(nickname.slice(0, 32))
                                        .catch (error => {
                                            message.reply("Couldn't set Nickname, might be lacking permissions");
                                        })
                                    setMemberRoleByName(message, "Clan Member");
                                } else {
                                    // if user isn't a member of any clan.
                                    setMemberAsCommomer(message, users, username);
                                }
                            } else {
                                requestPrimaryClan(message, users, userClans, username);
                            }
                        } else {
                            message.reply(`${snapshot.val().rbx_username}'s status doesn't match the provided key. Please add the code provided to you and set it as your Roblox's user status.`);
                        }
                    }
                    message.author.lastMessage.delete({timeout: 6000});
                } else {
                    // When user invokes !Verify <username>
                    if (!snapshot.val()) { // If they aren't within the database, it will create a profile for the member.
                        const userCode = uuidv4();
                        const rbx_userId = await getUserIdByUsername(args[0]);
                        users.child(authorId).update({
                            verify: false,
                            rbx_username: args[0],
                            verify_key: userCode,
                            userId: rbx_userId,
                            primary_clan: null
                        })
                        message.reply("Your verification key has been sent to you. If you didn't receive anything please ping a moderator.");
                        message.author.send(`In order to verify you're actually ${args[0]}. Please add \`${userCode}\` onto your update status via Roblox.\nOnce you have done so\, type \`!verify\``);
                    } else {
                        const data = snapshot.val();
                        if (data.verify) {
                            message.reply("You are already verified, if you want to change your roblox account, please use \`!reverify\`.")
                        } else {
                            message.reply(`There's still a pending verifciation under ${snapshot.val().rbx_username}. If you want to change roblox account, please use \`!reverify <username>\``);
                        }
                    }
                }
            })
        }
    },
    
    reverify: {
        usage: "!reverify <username>",
        description: "Change your Roblox verification acccount, this will require you to restart the whole process.",
        execute: async (client, message, db, args) => {
            if (args[0] != undefined) {
                const users = db.ref("/users");
                const authorId = message.author.id;
                users.child(authorId).once("value", async (snapshot) => {
                    if (snapshot.val()) {
                        const authorId = message.author.id;
                        const userCode = uuidv4();
                        const rbx_userId = await getUserIdByUsername(args[0]);
                        users.child(authorId).update({
                            verify: false,
                            rbx_username: args[0],
                            verify_key: userCode,
                            userId: rbx_userId,
                            primary_clan: null
                        })
                        removeAllObtainableRole(message);
                        message.reply("Your verification key has been sent to you. If you didn't receive anything please contact moderator.");
                        client.users.cache.get(authorId).send(`In order to verify you're actually ${args[0]}. Please add \`${userCode}\` onto your update status via Roblox.\nOnce you have done so\, type \`!verify\``);
                    }
                });
            }
        }
    },

    updatestatus: {
        usage: "!updatestatus",
        description: "To update your social status, clan rank and nickname.",
        execute: async (client, message, db) => {
            const users = db.ref("/users");
            const authorId = message.author.id;
            users.child(authorId).once("value", async (snapshot) => {
                if (snapshot.val()?.verify) {
                    const userId = snapshot.val().userId;
                    const username = snapshot.val().rbx_username;
                    const userGroups = await getUserGroupsByUserId(userId);
                    const userClans = userGroups.filter(element => client.clanIds.includes(element.Id));
                    requestPrimaryClan(message, users, userClans, username);
                } else {
                    message.reply("You must be verified to use this command.");
                }
            });
        }
    },
}