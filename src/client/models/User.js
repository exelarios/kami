const db = require("../../shared/firebase");
const users = db.collection("users");

class User {

    // the constructor function itself can't be async, so it will just return an async function.
    constructor(authorId) {
        return (async () => {
            this.authorId = authorId;
            this.users = users;
            this.userDoc = users.doc(authorId);
            this.userRef = await this.userDoc.get();
            this.exists = this.userRef.exists
            return this;
        })();
    }

    async create(payload) {
        if (this.exists) throw new Error("User's document has already been created.");
        await this.userDoc.set(payload);
    }

    /*
    * Updates the necessary values that's called within the updatedObject.
    * @params updatedObject the updated object
    * @returns void
    */
    async update(updatedObject) {
        if (!this.exists) throw new Error("User's document doesn't exist.");
        await this.userDoc.update(updatedObject);
    }

    get data() {
        return this.userRef.data();
    }

    get isVerified() {
        return this.data?.verify;
    }

    get isMuted() {
        if (!this.exists) return false;
        const currentTime = new Date().getTime() / 1000;
        return this.data.punish > Math.floor(currentTime);
    }

}

module.exports = User;