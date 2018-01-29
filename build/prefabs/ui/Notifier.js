export default class UI_Notifier extends Prefab {

    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };
        this.bgAlpha = this.properties.hasOwnProperty("bgAlpha") ? this.properties.bgAlpha : 0.8;
        this.showSeconds = this.properties.hasOwnProperty("showSeconds") ? this.properties.showSeconds : 5.0;
        this.colorBarWidth = this.properties.hasOwnProperty("colorBarWidth") ? this.properties.colorBarWidth : 7;
        this.textStyle = this.properties.hasOwnProperty("textStyle") ? this.properties.textStyle : { "font": "normal 12px Arial", "fill": "#000000" };
        this.screenWidthPercent = this.properties.hasOwnProperty("screenWidthPercent") ? this.properties.screenWidthPercent : 1.0;
        this.maxWidth = this.game.camera.width * this.screenWidthPercent;
        if (!this.textStyle.hasOwnProperty("wordWrap")) {
            this.textStyle.wordWrap = true;
            this.textStyle.wordWrapWidth = this.maxWidth - (this.colorBarWidth * 2) - 20;
        }

        let currentY = 0;

        // Center
        this.x = (this.game.camera.width - this.maxWidth) / 2;
        this.fixedToCamera = true;
    }

    notify(text, color = 0x000000, bgcolor = 0xffffff, showSeconds = undefined) {
        this.game.world.bringToTop(this);

        if (showSeconds === undefined) {
            showSeconds = this.showSeconds;
        }

        // Draw text & center
        const notifyText = new Phaser.Text(this.gameState.game, 0, 0, text, this.properties.textStyle);
        notifyText.x = (this.maxWidth - notifyText.width) / 2;
        
        // Push any other notifications down list
        let count = 0;
        for (let idx in this.children) {
            const child = this.children[idx];
            child.alpha = 0.5;
            child.y += notifyText.height;
        }
        
        // Draw bg & color bar
        const container = new Phaser.Graphics(game);
        container.beginFill(bgcolor, this.bgAlpha);
        container.drawRect(0, 0, this.maxWidth, notifyText.height);
        container.endFill();
        container.beginFill(color);
        container.drawRect(0, 0, this.colorBarWidth, notifyText.height);
        container.drawRect(this.maxWidth - this.colorBarWidth, 0, this.colorBarWidth, notifyText.height);
        container.endFill();
        container.addChild(notifyText);
        this.addChild(container);

        // Remove after timeout
        setTimeout(() => {
            this.game.add.tween(container).to({ alpha: 0 }, 500, Phaser.Easing.Sinusoidal.In, true).onComplete.add(() => {
                this.removeChild(container);
            });
        }, showSeconds * 1000);
    }
}