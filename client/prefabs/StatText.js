class StatText extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        this.statValue = null;

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
    }

    update() {
        // @TODO: make this event-driven rather than poll-driven, for performance
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
        }, this.gameState);
        if (currentValue !== this.statValue) {
            this.updateValue(currentValue);
        }
    }

    updateValue(value) {
        this.statValue = value;
        this.text.text = this.properties.label + value;
    }
}