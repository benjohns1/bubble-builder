export default class Component_PropertyListener extends Component {

    constructor(parent, property, callback, callbackContext, signal, context) {
        super(parent);
        this.propValue = null;
        this.property = property === undefined ? [null] : property;
        this.context = context || parent;
        this.callback = callback;
        this.callbackContext = callbackContext;
        this.isObjectProperty = false;

        // Listen for signal when property is updated
        if (Array.isArray(signal)) {
            this.signal = signal.reduce((prop, next) => {
                if (next === undefined) {
                    return prop;
                }
                if (prop.hasOwnProperty(next)) {
                    return prop[next];
                }
                return undefined;
            }, this.context);
            this.signal.add(this.checkUpdate, this);
        }

        this.checkUpdate();
    }

    checkUpdate() {
        let currentValue = this.property.reduce((prop, next) => {
            if (next === undefined) {
                return prop;
            }
            if (prop.hasOwnProperty(next)) {
                return prop[next];
            }
            return undefined;
        }, this.context);
        if ((currentValue !== this.propValue) || (typeof(currentValue) === "object")) {
            this.propValue = currentValue;
            this.callback.call(this.callbackContext, currentValue);
        }
    }
}