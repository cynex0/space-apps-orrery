class ObjectListener {
    object;
    listeners;

    constructor() {
        this.listeners = [];
    }

    set(object) {
        this.object = object;

        if (object) {
            this.listeners.forEach(listener => {
                listener(object);
            });
        }
    }

    get() {
        return this.object;
    }

    addListener(listener) {
        if (listener) {
            this.listeners.push(listener)
        }
    }
}

export default ObjectListener;