const db = require("../../server/utils/firebase");
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

    async create(userId) {
        if (this.exists) throw new Error("User's document has already been created.");
        await this.userDoc.set({
            verify: false,
            userId: userId,
            primary_clan: null
        })
    }

    async update(updatedObject) {
        if (!this.exists) throw new Error("User's document doesn't exist.");
        await this.userDoc.update(updatedObject);
    }

    get() {
        return this.userRef.data();
    }

    isVerified() {
        return this.get()?.verify;
    }

    isMuted() {
        if (!this.exists) return false;
        const currentTime = new Date().getTime() / 1000;
        return this.get()?.punish > Math.floor(currentTime);
    }

}

module.exports = User;