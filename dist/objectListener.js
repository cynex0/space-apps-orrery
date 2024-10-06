class ObjectListener {
    object;
    listener;

    constructor(listener) {
        this.listener = listener;
    }

    set(object) {
        this.object = object;

        if (this.listener) {
            this.listener();
        }
    }

    get() {
        return this.object;
    }
}

export default ObjectListener;