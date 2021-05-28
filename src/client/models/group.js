const db = require("../../shared/firebase");
const groups = db.collection("groups");

class Group {

    constructor(groupId) {
        return (async () => {
            this.groupId = groupId;
            this.groups = groups;
            this.groupDoc = groups.doc(groupId);
            this.groupRef = await this.groupDoc.get();
            this.exists = this.groupRef.exists;
            return this;
        })();
    }

    async getDisplayName() {
        return this.groupRef.data()?.displayName
    }

    async create(displayName) {
        if (this.exists) throw new Error("Group's document has already been created.");
        await this.groupDoc.set({
            displayName: displayName
        });
    }

    /*
    * Updates the necessary values that's called within the updatedObject.
    * @params updatedObject the updated object
    */
    async update(updatedObject) {
        if (!this.exists) throw new Error("Group's document doesn't exist.");
        await this.groupDoc.update(updatedObject);
    }

    get data() {
        return this.userRef.data();
    }

}

module.exports = Group;