export default class Exception {
    constructor(message) {
        this.message = message;
    }

    toString() {
        return "Exception: " + this.message;
    }
}