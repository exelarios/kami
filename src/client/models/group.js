const db = require("../../server/utils/firebase");
const groups = db.collection("groups");

class Group {

    constructor(groupId) {
        return (async () => {
            this.groupId = groupId;
            this.groupDoc = groups.doc(groupId);
            this.groupRef = await this.groupDoc.get();
            this.exists = this.groupRef.exists;
            return this;
        })();
    }

    async getDisplayName() {
        return this.groupRef.data()?.displayName
    }

    async setDisplayName(name) {

    }

}

module.exports = Group;