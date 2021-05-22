const Discord = require("discord.js");

function onVerify() {
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle("Almost there . . . ")
        .addField(`Join the place & confirm your account.`, "https://www.roblox.com/games/6459111781/tora-smells")
        .setFooter("If you didn't receive anything please ping an active moderator.");
}

function alreadyVerified() {
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle("You are already verified.")
        .addField("Want to update roles?", "Try `!update`.")
        .addField("Want to change the verify account?", "`!reverify`")
        .setFooter("If you're having any trouble feel free to ping an active moderator.");
}

function pendingVerify(props) {
    const { username } = props;
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle(`There's still a pending verifciation under ${username}.`)
        .addField("Join the place & confirm your account.", "https://www.roblox.com/games/6459111781/tora-smells")
        .addField("Want to change the verify account?", "`!reverify`")
        .setFooter("If you're having any trouble feel free to ping an active moderator.");
}

function verifyOptions() {
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle(`Pick your poison.`)
        .addField("Choice 1", "Update roles and nickname.")
        .addField("Choice 2", "Change verify account.")
        .setFooter("If you're having any trouble feel free to ping an active moderator.");
}

function displayPrompt(props) {
    const { title } = props;
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle(title);
}

module.exports = {
    onVerify,
    alreadyVerified,
    pendingVerify,
    displayPrompt,
    verifyOptions
}