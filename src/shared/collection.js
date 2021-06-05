const firestore = require("../shared/firebase");

class Collection {

    constructor(collectionName, authorId) {
        this.collection = firestore.collection(collectionName);
        this.authorId = authorId.toString();
    }

    async create(initalState) {
        const doesExist = await this.exists(this.authorId);
        if (doesExist) throw new Error("Document has already been created.");
        const document = this.collection.doc(this.authorId);
        return await document.set(initalState);
    }

    async exists() {
        const document = this.collection.doc(this.authorId);
        const userRef = await document.get();
        return userRef.exists;
    }

    async update(update) {
        const doesExist = await this.exists(this.authorId);
        if (!doesExist) throw new Error("Document doesn't exist."); 
        const document = this.collection.doc(this.authorId);
        return await document.update(update);
    }

    async data() {
        const document = this.collection.doc(this.authorId);
        const userRef = await document.get();
        return userRef.data();
    }

    async delete() {
        const document = this.collection.doc(this.authorId);
        const doesExist = await this.exists(this.authorId);
        if (!doesExist) throw new Error("Document doesn't exist."); 
        await document.delete();
    }
}

module.exports = Collection;