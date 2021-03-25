class Command {

    constructor(client, info) {
        this.client = client;
        this.permissions = info.permissions;
        this.channelOnly = info.channelOnly || true;
        this.cooldown = info.cooldown || 5;
    }

    hasPermission() {

    }

    hasCooldown(msg) {
        const lastTimeStamp = msg.author?.lastMessageTimestamp;
        const currentTime = Math.floor(new Date().getTime() / 1000);
        if ((currentTime - lastTimeStamp?.time) < this.cooldown) {
            if (!lastTimeStamp.warned) {
                lastTimeStamp.warned = true;
                msg.reply(`You are invoking commands too way, please wait ${this.cooldown} seconds before trying again.`);
            }
            return true;
        } else {
            msg.author.lastMessageTimestamp = {
               time: Math.floor(new Date().getTime() / 1000),
               warned: false
            };
            return false;
        }
    }

    async execute(msg, args) {
        if (this.hasCooldown(msg)) return;
        return this.run(msg, args);
    }
}

module.exports = Command;