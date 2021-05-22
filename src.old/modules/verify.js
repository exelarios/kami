const Discord = require("discord.js");
const { mainAPI, userAPI, groupAPI } = require("../utils/axios");
const { v4: uuidv4 } = require('uuid');
const util = require("../util/shared");
const { overwriteClan } = require("../util/titles");
const formatName = require("../util/formatName");

const getUserIdByUsername = async (username) => {
    try {
        const response = await mainAPI.get(`users/get-by-username?username=${username}`);
        return response.data.Id;
    } catch(error) {
        console.log("FAILED: GET_USER_ID_BY_USERNAME");
    }
}

const getUserStatsByUserId = async (userId) => {
    try {
        const response = await userAPI.get(`/v1/users/${userId}/status`);
        return response.data.status.replace(/\s+/g, '');
    } catch(error) {
        console.log("FAILED: GET_USER_STATS_BY_USER_ID");
    }
}

const getUserGroupsByUserId = async (userId) => {
    try {
        const response = await groupAPI.get(`/v2/users/${userId}/groups/roles`);
        return response.data.data; // Some idiot decided to name the array of objects "data".
    } catch(error) {
        console.log("FAILED: GET_USER_GROUP_BY_USER_ID");
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
            const setOfficial = await util.setMemberRoleByName(message, "Faction Official");
            if (!setOfficial) {
                message.reply("Failed to role you to Clan Official, please ping a moderator.");
            }
        } else { // Clan Member
            const setMember = await util.setMemberRoleByName(message, "Faction Member");
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
    users.doc(authorId).update({
        primary_clan: null,
        verify: true,
        punish: null,
    });
}

async function requestPrimaryClan(message, users, userClans, username) {
    const numOfClans = userClans.length;
    const numberToEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

    if (numOfClans < 1) {
        util.removeAllObtainableRole(message);
        setMemberAsCommomer(message, users, username);
        return;
    }

    function clanSelected(clanChoice) {
        if (clanChoice) {
            const clanName = overwriteClan[formatName(clanChoice.group.name)] || formatName(clanChoice.group.name);
            const clanRank = formatName(clanChoice.role.name);
            const nickname = `\[${clanName}\] ${clanRank} | ${username}`;
            message.member.setNickname(nickname.slice(0, 32))
                .catch (error => {
                    message.reply("Couldn't set Nickname, might be lacking permissions");
                })
            users.doc(message.author.id).update({
                verify: true,
                punish: null,
                primary_clan: clanChoice.group.id
            });
            util.removeAllObtainableRole(message);
            setSocialStatusByGroupRank(message, clanChoice);
        } else {
            message.reply("Please input an vaild number corresponding to the clan name. Please try again.");
        }
    }

    let headingChoice = await message.channel.send("Please enter the number corresponding to the clan you want to represent.\n");
    const clanListing = userClans.map((clan, index) => {
        let output = "";
        output += "[" + (index + 1) + "] "+ (overwriteClan[formatName(clan.group.name)] || formatName(clan.group.name));
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
                message.reply("Await Reaction Timeout. Please try again.")
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
            message.reply("Await Response Timeout. Please try again.");
        }
    }
}

async function createProfile(message, users, username) {
    const authorId = message.author.id;
    const userCode = uuidv4();
    const rbx_userId = await getUserIdByUsername(username);

    if (!rbx_userId) {
        const errorMessage = new Discord.MessageEmbed()
            .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
            .setTitle("Please enter a valid roblox username.")
            .addField("Need help?", "Ping an active moderator.");
        message.reply(errorMessage);
        return;
    }

    await users.doc(authorId).set({
        verify: false,
        rbx_username: username,
        verify_key: userCode,
        userId: rbx_userId,
        primary_clan: null
    });

    const sendKey = new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle(`Please post the provided key onto your feed.`)
        .setDescription("https://roblox.com/feeds")
        .addField("Verification Key", `\`${userCode}\``)
        .addField("What's next?", "Go back to `join-verification` and type `!verify`")
        .setImage("https://i.imgur.com/sAl9tu2.png");
    try {
        const responseMessage = new Discord.MessageEmbed()
            .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
            .setTitle("Your verification key has been sent!")
            .setDescription("If you didn't receive anything please ping an active moderator.");
        message.author.send(sendKey);
        message.reply(responseMessage);
    } catch(error) {
        message.reply(sendKey);
    }
}

const commands = [
    {
        usage: "!verify <username>",
        description: "To verify new users to the community.",
        execute: async (client, message, db, args) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            const authorId = message.author.id;
            const users = db.collection("users");
            const user = await users.doc(authorId).get();
            if (args[0] == undefined) {
                if (!user.exists) {
                    const errorMessage = new Discord.MessageEmbed()
                        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
                        .setTitle("You must first provide us your username.")
                        .setDescription("Try `!verify <username>` without the inequality signs.")
                        .addField("Want to change the verify account?", "Try `!reverify <ROBLOX_USERNAME>` without inequality signs.")
                        .addField("Need help?", "Ping an active moderator.");
                    message.reply(errorMessage);
                } else {
                    const snapshot = user.data();
                    const currentTime = new Date().getTime() / 1000
                    if (snapshot.punish > Math.floor(currentTime)) {
                        message.reply("You aren't allowed to use this command at this time. Try again later.");
                        return;
                    }
                    if (snapshot.verify != undefined) {
                        if (snapshot.verify == true) {
                            const errorMessage = new Discord.MessageEmbed()
                                .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
                                .setTitle("You are already verified.")
                                .addField("Want to get your roles back?", "Try `!update`.")
                                .addField("Want to change the verify account?", "Try `!reverify <username>` without inequality signs.")
                                .addField("Need help?", "Ping an active moderator.");
                            message.reply(errorMessage);
                        } else {
                            const userId = snapshot.userId;
                            const username = snapshot.rbx_username;
                            const userStatus = await getUserStatsByUserId(userId);
                            if (userStatus == snapshot.verify_key) {
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
                                        const clanRank = formatRank(clan.role.name);
                                        const nickname = `\[${clanName}\] ${clanRank} | ${username}`;
                                        await users.doc(authorId).update({
                                            primary_clan: clan.group.id,
                                            verify: true
                                        })
                                        util.removeAllObtainableRole(message);
                                        message.member.setNickname(nickname.slice(0, 32))
                                            .catch (error => {
                                                message.reply("Couldn't set Nickname, might be lacking permissions");
                                            })
                                        setSocialStatusByGroupRank(message, clan);
                                    } else {
                                        // if user isn't a member of any clan.
                                        setMemberAsCommomer(message, users, username);
                                    }
                                } else {
                                    requestPrimaryClan(message, users, userClans, username);
                                }
                            } else {
                                const errorMessage = new Discord.MessageEmbed()
                                    .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
                                    .setTitle(`${snapshot.rbx_username}'s status doesn't match the provided key.`)
                                    .addField("Still want to verify on that account?", "Update your status as the key, then do `!verify`.\nhttps://roblox.com/feeds")
                                    .addField("Want to change the verify account?", "Try `!reverify <username>` without inequality signs.")
                                    .addField("Need help?", "Ping an active moderator.");
                                message.reply(errorMessage);
                            }
                        }
                    } else {
                        message.reply("You must invoke `!verify <username>` before you can use this command");
                    }
                }
                // message && message.author.lastMessage.delete({timeout: 6000}); // check if the message still exist before deleting it.
            } else {
                // When user invokes !Verify <username>
                const snapshot = user.data();
                if (snapshot) { // Member may have a profile created.
                    const currentTime = new Date().getTime() / 1000;
                    if (snapshot.punish > Math.floor(currentTime)) {
                        message.reply("You aren't allowed to use this command at this time. Try again later.");
                        return;
                    } else if (snapshot.verify == undefined) {
                        createProfile(message, users, args[0]);
                        return;
                    }
                    if (snapshot.verify == true) {
                        const errorMessage = new Discord.MessageEmbed()
                            .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
                            .setTitle(`There's still a pending verifciation under ${snapshot.rbx_username}.`)
                            .addField("Still want to verify on that account?", "Paste your key into https://roblox.com/feeds then do `!verify`")
                            .addField("Want to change the verify account?", "Try `!reverify <username>` without inequality signs.")
                            .addField("Need help?", "Ping an active moderator.");
                        message.reply(errorMessage);
                        return;
                    } else {
                        const errorMessage = new Discord.MessageEmbed()
                            .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
                            .setTitle(`There's still a pending verifciation under ${snapshot.rbx_username}.`)
                            .addField("Still want to verify on that account?", "Paste your key into https://roblox.com/feeds then do `!verify`")
                            .addField("Want to change the verify account?", "Try `!reverify <username>` without inequality signs.")
                            .addField("Need help?", "Ping an active moderator.");
                        message.reply(errorMessage);
                        return;
                    }
                } else {
                    // Member has no DATA at all.
                    createProfile(message, users, args[0]);
                }
            }
        }
    },
    {
        usage: "!reverify <username>",
        description: "Change your Roblox verification acccount, this will require you to restart the whole process.",
        execute: async (client, message, db, args) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            if (args[0] != undefined) {
                const authorId = message.author.id;
                const users = db.collection("users");
                const user = await users.doc(authorId).get();
                if (user.exists) {
                    const snapshot = user.data();
                    const currentTime = new Date().getTime() / 1000;
                    if (snapshot.punish > Math.floor(currentTime)) {
                        message.reply("You aren't allowed to use this command at this time. Try again later.");
                        return;
                    }
                    util.removeAllObtainableRole(message);
                    createProfile(message, users, args[0]);
                }
            } else {
                message.reply("Requires a second argument as a Roblox's username.");
            }
        }
    },
    {
        usage: "!update",
        description: "To update your social status, clan rank and nickname.",
        execute: async (client, message, db) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            const authorId = message.author.id;
            const users = db.collection("users");
            const doc = await users.doc(authorId).get();
            if (doc.exists) {
                const snapshot = doc.data();
                const currentTime = new Date().getTime() / 1000
                if (snapshot.punish > Math.floor(currentTime)) {
                    message.reply("You aren't allowed to use this command at this time. Try again later.")
                        .then(reply => {
                            reply.delete({ timeout: 5000 })
                        })
                        .catch(console.error);
                    return;
                }

                if (snapshot.verify) {
                    const userId = snapshot.userId;
                    const username = snapshot.rbx_username;
                    const userGroups = await getUserGroupsByUserId(userId);
                    const userClans = userGroups.filter(element => client.clanIds.includes(element.group.id));
                    requestPrimaryClan(message, users, userClans, username);
                } else {
                    message.reply("You must be verified to use this command.")
                        .then(reply => {
                            reply.delete({ timeout: 5000 })
                        })
                        .catch(console.error);
                }
            } else {
                message.reply("Please verify before using this command.")
                    .then(reply => {
                        reply.delete({ timeout: 5000 })
                    })
                    .catch(console.error);
            }
        }
    },

    {
        usage: "!whois <mention>",
        description: "displays known information about the mention.",
        execute: async (client, message, db, args) => {

            if (message.channel.type == "dm") {
                message.reply("Please retry the command on a channel.");
                return;
            }

            if (!message.member.hasPermission("MANAGE_ROLES")) {
                message.reply("You lack permissions you execute this command.")
                    .then(reply => {
                        reply.delete({ timeout: 5000 })
                            .catch(console.error);
                    });
                return;
            }

            if (!args[0]) {
                message.reply("Missing arguments or incorrect formatting. Please make sure you include the mention of the member and the duration of the detainment.")
                return;
            }

            const target = message.mentions.users.first() || args[0];
            const users = db.collection("users");
            const user = await users.doc(target.id).get();
            const snapshot = user.data();
            if (user) {
                const rbx_userId = snapshot.userId;
                try {
                    const targetMember = message.guild.members.cache.get(target.id);
                    const playerRecord = new Discord.MessageEmbed()
                        .setAuthor(`${targetMember.user.username}#${targetMember.user.discriminator}`, targetMember.user.displayAvatarURL())
                        .setTitle(targetMember.nickname || targetMember.user.username)
                        .setURL(`https://roblox.com/users/${rbx_userId}/profile`)
                    message.reply(playerRecord);
                } catch(error) {
                    console.log(error);
                    message.reply("Oh no, something went wrong. Please contact the great Algorist.");
                }
            } else {
                message.reply("The user doesn't that seem to be recorded in our database.")
                    .then(reply => {
                        reply.delete({ timeout: 5000 })
                    })
            }
        }
    }
]

function setCommoner(client, member) {

}

function setFactionMember(client, member) {

}

const actions = {
    update: async (client, db, id) => {
        const server = client.guilds.cache.find(guild => guild.id == client.SERVER_ID || guild.id == client.TEST_ID);
        const member = server.members.cache.find(member => member.id == id);
        if (server && user) {
            const users = db.collection("users");
            const user = users.doc(id);
            const doc = await user.get();
            if (doc.exists) {
                const snapshot = doc.data();
                if (snapshot.primary_clan) {

                } else {

                }
            }
        } else {
            console.log("Fail to find server or member of the server.");
        }
    } 
}

module.exports = {
    commands,
    actions
}