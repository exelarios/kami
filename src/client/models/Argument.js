const { displayPrompt } = require("../utils/embeds");

class Argument {

    constructor(client, prompts) {
        this.client = client;
        this.prompts = prompts;
    }

    async obatin(msg, args) {
        let responses = [];
        let currentPrompt = 0;
        if (args.length == 0) {
            if (this.prompts == undefined) return;
            while(currentPrompt < this.prompts.length) {
                const prompt = displayPrompt({
                    title: this.prompts[currentPrompt].prompt
                });
                msg.reply(prompt);
                const response = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
                    max: 1,
                });

                if (response && response.size == 1) {
                    responses.push(response.first().content);
                }
                currentPrompt++;
            }

            return responses;
        }

        // let combineLastArg = ""
        // for (let i = this.prompts.length - 1; i < args.length; i++) {
        //     combineLastArg += args[i];
        // }

        return args;
    }
}

module.exports = Argument;