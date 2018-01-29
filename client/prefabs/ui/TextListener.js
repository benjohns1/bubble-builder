export default class UI_TextListener extends Prefab {

    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        if (!this.properties.hasOwnProperty("textStyle")) {
            this.properties.textStyle =  {
                "font": "16px Arial",
                "fill": "#000000"
            };
        }

        // Display text
        this.text = new Phaser.Text(this.gameState.game, 0, 0, null, this.properties.textStyle);
        this.text.anchor.setTo(this.anchor.x, this.anchor.y);
        this.addChild(this.text);

        // Determine property/listener context (use gameState as base context)
        let context = undefined;
        if (Array.isArray(this.properties.context)) {
            context = this.properties.context.reduce((context, prop) => {
                if (prop === undefined) {
                    return context;
                }
                if (context.hasOwnProperty(prop)) {
                    return context[prop];
                }
                return undefined;
            }, this.gameState);
        }
        else {
            context = this.properties.context;
        }

        // Create property listener and onChange signal
        this.onChange = new Phaser.Signal();
        this.listener = new Component_PropertyListener(this, this.properties.property, this.updateValue, this, this.properties.signal, context);
    }

    updateValue(value) {

        if (this.properties.valueFormat && this.properties.valueFormat.methodName) {
            // Format the value if a display formatter is specified
            value = value[this.properties.valueFormat.methodName](...(this.properties.valueFormat.args));
        }
        
        // Set text
        value = value === undefined ? "" : value;
        this.text.text = this.properties.label !== undefined ? this.properties.label + value : value;
        this.onChange.dispatch(this.text.text);
    }
}