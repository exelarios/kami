const { slashAPI } = require("../utils/axios");
const axios = require("axios");
class Slash {

    constructor(token, clientId) {
        if (!token) throw Error("No provided provided.");
        if (!clientId) throw Error("No clientId provided.");
        this.token = token;
        this.clientId = clientId;
    }

    async getCommands(options) {
        if (options != undefined) {
            if (typeof options !== "object")
                throw new Error("Options must be type object. Received: " + typeof options);

            if (options.commandId && typeof options.commandId !== "string")
                throw new Error("commandId received wasn't of type string. Received: " + typeof options.commandId);
        }
        
        let url = `applications/${this.clientId}/commands`;

        if (options?.commandId)
            url += `/${options.commandId}`;

        const response = await slashAPI.get(url, {
            headers: { 
                Authorization: `Bot ${this.token}` 
            }
        });

        return response.data;
    }

    async createCommand(options) {
        if (typeof options !== "object")
            throw new Error("options must be type object. Received" + typeof options);

        if (!options.name)
            throw new Error("options is missing name.");
        
        if (!options.description)
            throw new Error("options is missing description");

        const response = await slashAPI.post(`applications/${this.clientId}/commands`, options, {
            headers: { 
                Authorization: `Bot ${this.token}` 
            }
        })

        return response.data;
    }

    async deleteCommand(commandId) {

    }

    async editCommand(options, commandId) {
        if (typeof options !== "object")
            throw new Error("options must be of type object. Received: " + typeof options);

        if (typeof commandId !== "string")
            throw new Error("commandId must be of type string. Received: " + typeof commandId);

        if (!options.name || !options.description)
            throw new Error("options is missing name or description property!");

        const res = await slashAPI.patch(`applications/${this.clientId}/commands/${commandId}`, options, {
            headers: { Authorization: `Bot ${this.token}` },
        });

        return res.data;
    }

}

module.exports = Slash;