class UI_StatText extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        this.statValue = null;
        this.statContext = this.properties.statContext || this.gameState;

        // Set prefab property defaults
        if (!this.properties.hasOwnProperty("default")) {
            this.properties.default = 0;
        }
        if (!this.properties.hasOwnProperty("textStyle")) {
            this.properties.textStyle =  {
                "font": "16px Arial",
                "fill": "#000000"
            };
        }
        this.text = new Phaser.Text(this.gameState.game, 0, 0, null, this.properties.textStyle);
        this.text.anchor.setTo(this.anchor.x, this.anchor.y);
        this.addChild(this.text);
        this.updateValue(this.properties.default);
        this.update();
    }

    update() {
        // @TODO: make this event-driven rather than poll-driven, for performance
        if (this.name == "title") {
            console.log("updated!");
        }
        if (!this.text) {
            return;
        }
        let currentValue = this.properties.stat.reduce((prop, next) => {
            if (next === undefined) {
                return prop;
            }
            if (prop.hasOwnProperty(next)) {
                return prop[next];
            }
            return undefined;
        }, this.statContext);
        if (currentValue !== this.statValue) {
            
            this.updateValue(currentValue);
        }
    }

    updateValue(value) {
        this.statValue = value;

        if (this.properties.valueFormat && this.properties.valueFormat.methodName) {
            // Format the value if a display formatter is specified
            value = value[this.properties.valueFormat.methodName](...(this.properties.valueFormat.args));
        }
        
        this.text.text = this.properties.label !== undefined ? this.properties.label + value : value;
    }
}