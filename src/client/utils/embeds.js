const { Discord } = require("./discord");

function message(props) {
    const { title, message } = props;
    return new Discord.MessageEmbed()
        .setAuthor(title, "https://i.imgur.com/lyyexpK.gif")
        .setTitle(message);
}

function onVerify() {
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle("Almost there . . . ")
        .addField(`Join the place & confirm your account.`, "https://www.roblox.com/games/6459111781/tora-smells")
        .setFooter("If you didn't receive anything please ping an active moderator.");
}

function pendingVerification(props) {
    const { username } = props;
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle(`There's still a pending verifciation under ${username}.`)
        .addField("Join the place & confirm your account.", "https://www.roblox.com/games/6459111781/tora-smells")
        .addField("Want to change the verify account?", "`/reverify`")
        .setFooter("If you're having any trouble feel free to ping an active moderator.");
}

function verified() {
    return new Discord.MessageEmbed()
        .setAuthor("Gekokujō's Verification", "https://i.imgur.com/lyyexpK.gif")
        .setTitle("You are already verified.")
        .addField("Want to update roles?", "Try `/update`.")
        .addField("Want to change the verify account?", "`/reverify`")
        .setFooter("If you're having any trouble feel free to ping an active moderator.");
}
        
module.exports = {
    message,
    pendingVerification,
    onVerify,
    verified
}