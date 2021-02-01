const { mainAPI, userAPI, groupAPI } = require("../util/axios");
const { v4: uuidv4 } = require('uuid');
const { clans } = require("../util/titles");
const util = require("../util/shared");

const getUserIdByUsername = async (username) => {
    try {
        const response = await mainAPI.get(`users/get-by-username?username=${username}`);
        return response.data.Id;
    } catch(error) {
        console.log("GET_USER_ID_BY_USERNAME");
    }
}

const getUserStatsByUserId = async (userId) => {
    try {
        const response = await userAPI.get(`/v1/users/${userId}/status`);
        return response.data.status.replace(/\s+/g, '');
    } catch(error) {
        console.log("GET_USER_STATS_BY_USER_ID");
    }
}

const getUserGroupsByUserId = async (userId) => {
    try {
        const response = await groupAPI.get(`/v2/users/${userId}/groups/roles`);
        return response.data.data; // Some idiot decided to name the array of objects "data".
    } catch(error) {
        console.log("GET_USER_GROUP_BY_USER_ID");
    }
}

const setSocialStatusByGroupRank = async (message, clan) => {
    const rank = clan.role.rank;
    if (rank) {
        if (rank == 255) { // Faction Leader
            const setLeader = await util.setMemberRoleByName(message, "Faction Leader");
            if (!setLeader) {
                message.reply("Failed to role you to Faction Leader, please ping a moderator.");
            }
        } else if (rank >= 225 && rank < 255) { // Clan Official
            const setOfficial = await util.setMemberRoleByName(message, "Clan Official");
            if (!setOfficial) {
                message.reply("Failed to role you to Clan Official, please ping a moderator.");
            }
        } else {
            const setMember = await util.setMemberRoleByName(message, "Clan Member");
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
    const setCommomer = await util.setMemberRoleByName(message, "Commoner");
    if (!setCommomer) {
        message.reply("Failed to role you to Commoner, please ping a moderator.");
    }
    users.child(authorId).update({
        primary_clan: null,
        verify: true,
        punish: null,
    });
}

const requestPrimaryClan = async (message, userStore, userClans, username) => {
    const numOfClans = userClans.length;
    const numberToEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

    if (numOfClans < 1) {
        util.removeAllObtainableRole(message);
        setMemberAsCommomer(message, userStore, username);
        return;
    }

    function clanSelected(clanChoice) {
        if (clanChoice) {
            const clanName = clans[clanChoice.group.name] || clanChoice.group.name;
            const nickname = `\[${clanName}\] ${clanChoice.role.name.split(" ")[0]} | ${username}`;
            message.member.setNickname(nickname.slice(0, 32))
                .catch (error => {
                    message.reply("Couldn't set Nickname, might be lacking permissions");
                })
            userStore.child(message.author.id).update({
                verify: true,
                punish: null,
                primary_clan: {
                    Name: clanName,
                    Id: clanChoice.group.id,
                    Rank: clanChoice.role.rank,
                    Role: clanChoice.role.name,
                }
            });
            util.removeAllObtainableRole(message);
            setSocialStatusByGroupRank(message, clanChoice);
        } else {
            message.reply("Please input an vaild number corresponding to the clan name. You may retry by typing `!verify`");
        }
    }

    let headingChoice = await message.channel.send("Please enter the number corresponding to the clan you want to represent.\n");
    const clanListing = userClans.map((clan, index) => {
        let output = "";
        output += "[" + (index + 1) + "] "+ (clans[clan.group.name] || clan.group.name);
        return output;
    })

    if (numOfClans <= 10) {
        let listing = await message.channel.send(clanListing);
        if (listing) {
            userClans.map((clan, index) => {
                listing.react(numberToEmoji[index]);
            })
            const filter = (reaction, user) => {
                const containsEmoji = numberToEmoji.includes(reaction.emoji.name);
                return containsEmoji && user.id === message.author.id;
            }
            try {
                const awaitReaction = await listing.awaitReactions(filter, {max: 1, time: 15000, errors: ["time"]});
                const choiceOfEmoiji = awaitReaction.first().emoji.name;
                const choice = numberToEmoji.indexOf(choiceOfEmoiji);
                const clanChoice = userClans[choice];
                clanSelected(clanChoice);
            } catch(error) {
                message.reply("Await Reaction Timeout. You may retry by typing `!verify`")
            }
            listing.delete();
            headingChoice.delete();
        }
    } else {
        try {
            message.channel.send(clanListing);
            const filter = msg => msg.author.id === message.author.id;
            const getAwaitMessage = await message.channel.awaitMessages(filter, {max: 1, time: 10000, errors: ["time", "max"]});
            if (getAwaitMessage) {
                const clanChoice = userClans[getAwaitMessage.first().content - 1];
                clanSelected(clanChoice);
            }
        } catch(error) {
            message.reply("Await Response Timeout. You may retry by typing `!verify`")
        }
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
                            "You aren't recorded in our database," +
                            "provide your Roblox's username as the second argument: `!verify <username>`\n" +
                            "Once you have verfied type `!verify` once again without any arguments."
                        ).then(reply => {
                            reply.delete({ timeout: 5000 })
                                .catch(console.error);
                        });
                    } else {
                        const currentTime = new Date().getTime() / 1000
                        if (snapshot.val().punish > Math.floor(currentTime)) {
                            message.reply("You aren't allowed to use this command at this time. Try again later.");
                            return;
                        }

                        if (snapshot.val().verify != undefined) {
                            if (snapshot.val().verify == true) {
                                message.reply("You are already verified, if you want to change accounts,"
                                + "you may use `!reverify <username>`. If you think this is a mistake please ping a moderator.");
                            } else {
                                const userId = snapshot.val().userId;
                                const username = snapshot.val().rbx_username;
                                const userStatus = await getUserStatsByUserId(userId);
                                if (userStatus == snapshot.val().verify_key) {
                                    // User has been verified.
                                    const userGroups = await getUserGroupsByUserId(userId);
                                    if (!userGroups) {
                                        console.error("Couldn't get user's groups");
                                    }
                                    const userClans = userGroups.filter(element => client.clanIds.includes(element.group.id));
                                    if (userClans.length <= 1) { // If user has one or less than one group.
                                        const clan = userClans[0];
                                        if (clan) {
                                            const clanName = clans[clan.group.name] || clan.group.name;
                                            const nickname = `\[${clanName}\] ${clan.role.name.split(" ")[0]} | ${username}`;
                                            users.child(authorId).update({
                                                primary_clan: {
                                                    Name: clanName,
                                                    Id: clan.group.id,
                                                    Rank: clan.role.rank,
                                                    Role: clan.role.name,
                                                },
                                                verify: true
                                            });
                                            util.removeAllObtainableRole(message);
                                            message.member.setNickname(nickname.slice(0, 32))
                                                .catch (error => {
                                                    message.reply("Couldn't set Nickname, might be lacking permissions");
                                                })
                                            util.setMemberRoleByName(message, "Clan Member");
                                        } else {
                                            // if user isn't a member of any clan.
                                            setMemberAsCommomer(message, users, username);
                                        }
                                    } else {
                                        requestPrimaryClan(message, users, userClans, username);
                                    }
                                } else {
                                    message.reply(`${snapshot.val().rbx_username}'s status doesn't match the provided key. Please add the code provided to you and set it as your Roblox's user status.`)
                                        .then(reply => {
                                        reply.delete({ timeout: 5000 })
                                            .catch(console.error);
                                    });
                                }
                            }
                        } else {
                            message.reply("You must invoke `!verify <username>` before you can use this command");
                        }
                    }
                    message.author.lastMessage.delete({timeout: 6000});
                } else {
                    // When user invokes !Verify <username>
                    async function createProfile() {
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
                    }

                    const data = snapshot.val();
                    if (data) { // Member may have a profile created.
                        const currentTime = new Date().getTime() / 1000;
                        if (snapshot.val().punish > Math.floor(currentTime)) {
                            message.reply("You aren't allowed to use this command at this time. Try again later.");
                            return;
                        } else if (data.verify == undefined) {
                            createProfile();
                            return;
                        }

                        if (data.verify == true) {
                            message.reply("You are already verified, if you want to change your roblox account, please use \`!reverify\`.")
                            return;
                        } else {
                            message.reply(`There's still a pending verifciation under ${snapshot.val().rbx_username}. If you want to change roblox account, please use \`!reverify <username>\``);
                            return;
                        }

                    } else {
                        // Member has no DATA at all.
                        createProfile();
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
                        const currentTime = new Date().getTime() / 1000
                        if (snapshot.val().punish > Math.floor(currentTime)) {
                            message.reply("You aren't allowed to use this command at this time. Try again later.");
                            return;
                        }
                        const authorId = message.author.id;
                        const userCode = uuidv4();
                        const rbx_userId = await getUserIdByUsername(args[0]);
                        users.child(authorId).update({
                            verify: false,
                            rbx_username: args[0],
                            verify_key: userCode,
                            userId: rbx_userId,
                            primary_clan: null,
                        })
                        util.removeAllObtainableRole(message);
                        message.reply("Your verification key has been sent to you. If you didn't receive anything please contact a moderator.");
                        client.users.cache.get(authorId).send(`In order to verify you're actually ${args[0]}. Please add \`${userCode}\` onto your update status via Roblox.\nOnce you have done so\, type \`!verify\``);
                    }
                });
            }
        }
    },

    update: {
        usage: "!update",
        description: "To update your social status, clan rank and nickname.",
        execute: async (client, message, db) => {
            const users = db.ref("/users");
            const authorId = message.author.id;
            users.child(authorId).once("value", async (snapshot) => {
                const user = snapshot.val();
                if (user) {
                    const currentTime = new Date().getTime() / 1000
                    if (user.punish > Math.floor(currentTime)) {
                        message.reply("You aren't allowed to use this command at this time. Try again later.")
                            .then(reply => {
                                reply.delete({ timeout: 5000 })
                                    .catch(console.error);
                            });
                        return;
                    }

                    if (user.verify) {
                        const userId = snapshot.val().userId;
                        const username = snapshot.val().rbx_username;
                        const userGroups = await getUserGroupsByUserId(userId);
                        const userClans = userGroups.filter(element => client.clanIds.includes(element.group.id));
                        requestPrimaryClan(message, users, userClans, username);
                    } else {
                        message.reply("You must be verified to use this command.")
                            .then(reply => {
                                reply.delete({ timeout: 5000 })
                                    .catch(console.error);
                            });
                    }
                } else {
                    message.reply("Please verify before using this command.")
                        .then(reply => {
                            reply.delete({ timeout: 5000 })
                                .catch(console.error);
                        });
                }
            });
        }
    },
}