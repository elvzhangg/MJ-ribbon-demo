

export class EventDispatcher {
    constructor() {
        this.listeners = {};
    }

    addEventListener(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }

    removeEventListener(type, callback) {
        if (!this.listeners[type]) return;

        const index = this.listeners[type].indexOf(callback);
        if (index !== -1) {
            this.listeners[type].splice(index, 1);
        }
    }

    dispatchEvent(event) {

        if (!this.listeners[event.type]) return;

        this.listeners[event.type].forEach((callback) => callback(event));

    }
}

