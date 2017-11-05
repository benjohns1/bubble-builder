class UI_Popup extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        // Set property defaults
        this.debug = this.properties.debug || false;

        this.cornerRadius = 2;
        this.closeTextStyle = {
            "font": "15px Arial",
            "fill": "#ffffff"
        };
        this.closeButtonSize = {
            x: 15,
            y: 15
        };
        this.margins = {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        };
    }

    open(displayData, x, y) {
        // Reset any currently visible popups
        this.close();
        
        if (!displayData || !Object.entries(displayData).length) {
            return;
        }
        const displayElements = Object.entries(displayData);
        if (!displayElements.length) {
            return;
        }

        // Move popup to this location and bring to front
        this.x = x;
        this.y = y;
        this.game.world.bringToTop(this);

        // Get window content from source, and display it
        let elementX = this.margins.left;
        let elementY = this.margins.top;
        let maxWidth = 0;
        this.dataPrefabs = [];
        displayElements.map(item => {
            const name = item[0], element = item[1];
            let prefab = this.gameState.prefabFactory(element.prefabType, name, elementX, elementY, element.properties);
            this.dataPrefabs.push(prefab);
            elementY += prefab.getMaxChildProperty('height');
            let prefabWidth = prefab.getMaxChildProperty('width');
            if (maxWidth < prefabWidth) {
                maxWidth = prefabWidth;
            }
        });

        // Create generic window graphics
        const width = Math.max(maxWidth, this.closeButtonSize.x) + this.margins.left + this.margins.right;
        const height = Math.max(elementY, this.closeButtonSize.y) + this.margins.bottom;
        this.bg = UI_Popup.createBgGraphics(this.game, width, height, this.cornerRadius);
        this.closeButton = UI_Popup.createButton(this.game, this.closeButtonSize.x, this.closeButtonSize.y, this.cornerRadius, "x", this.closeTextStyle, this.close, this);
        this.closeButton.x = width - this.closeButtonSize.x; // place button at top-right
        this.addChild(this.bg);
        this.addChild(this.closeButton);

        this.dataPrefabs.map(prefab => {
            this.bg.addChild(prefab);
            console.log(prefab);
        });
    }

    close() {
        this.dataPrefabs = [];
        for (let i = this.children.length-1; i >= 0; i--) {
            this.children[i].destroy();
        }
    }
    
    static createBgGraphics(game, width, height, cornerRadius) {

        // Draw bg
        const g = new Phaser.Graphics(game);
        g.beginFill(0xffffff);
        g.drawRoundedRect(0, 0, width, height, cornerRadius);
        g.endFill();

        return g;
    }

    static createButton(game, width, height, cornerRadius, text, textStyle, closeCallback, context) {
        const closeButton = UI_Popup.createButtonGraphics(this.game, width, height, cornerRadius);
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