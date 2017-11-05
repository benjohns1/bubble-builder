class UI_ResourceTrader extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        // Set property defaults
        this.debug = this.properties.debug || false;

        this.margins = this.properties.margins;

        let width = 100, height = 100, cornerRadius = 2;

        // @TODO: turn this into generic button prefab (use prefab for Popup close button, too)
        this.btnTake = this.constructor.createButton(this.game, width, height, cornerRadius, "asdf", {}, this.takeResource, this);
        this.addChild(this.btnTake);
    }

    takeResource() {
        console.log('take resource');
    }

    static createButton(game, width, height, cornerRadius, text, textStyle, closeCallback, context) {
        const closeButton = this.createButtonGraphics(this.game, width, height, cornerRadius);
        const button = new Phaser.Button(game, 0, 0, closeButton.generateTexture(), closeCallback, context);
        const textObj = new Phaser.Text(game, 4, -3, text, textStyle);
        button.addChild(textObj);
        return button;
    }

    static createButtonGraphics(game, width, height, cornerRadius) {
        const g = new Phaser.Graphics(game);
        g.beginFill(0xaaaaaa);
        g.drawRoundedRect(0, 0, width, height, cornerRadius);
        g.endFill();

        return g;
    }
}