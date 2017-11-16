class UIFactory_TextDropdown {

    constructor(game, textStyle = { "font": "16px Arial", "fill": "#000000" }, cornerRadius = 2, padding = { "top": 0, "right": 0, "bottom": 0, "left": 0 }, textOffset = { "x": 0, "y": 0 }) {
        this.game = game;
        this.cornerRadius = cornerRadius;
        this.textStyle = textStyle;
        this.padding = padding;
        this.textOffset = textOffset;
    }

    create(text, callback = undefined, context = undefined, x = 0, y = 0, width = undefined, height = undefined, cornerRadius = this.cornerRadius, textStyle = this.textStyle, padding = this.padding, textOffset = this.textOffset) {

        // Create button text
        let textObj;
        if (text !== undefined && text !== null) {
            textObj = new Phaser.Text(this.game, textOffset.x + padding.left, textOffset.y + padding.top, text, textStyle);

            // Auto-set button size to text size, if size not explicitly set
            width = width === undefined ? textObj.width : width;
            height = height === undefined ? textObj.height : height;
        }

        const buttonHeight = padding.top + height + padding.bottom,
            triangleWidth = 15,
            triangleHeight = 8;
        const triangleLeft = padding.left + width + (padding.right / 2),
            triangleTop = (buttonHeight / 2) - (triangleHeight / 2);

        // Create button graphics
        const g = new Phaser.Graphics(this.game);
        g.beginFill(0xaaaaaa);
        g.drawPolygon([
            triangleLeft, triangleTop,
            triangleLeft + triangleWidth, triangleTop,
            triangleLeft + (triangleWidth / 2), triangleTop + triangleHeight
        ]);
        g.endFill();
        g.beginFill(0xffffff, 0);
        g.lineStyle(1, 0xaaaaaa);
        g.drawRoundedRect(0, 0, triangleLeft + triangleWidth + padding.right, buttonHeight, cornerRadius);
        g.endFill();

        // Create button object
        const button = new Phaser.Button(this.game, x, y, g.generateTexture(), callback, context);
        if (textObj) {
            button.addChild(textObj);
        }

        // @TODO: add dropdown behavior (make new Dropdown class or add children to Phaser.Button?)

        return button;
    }
}