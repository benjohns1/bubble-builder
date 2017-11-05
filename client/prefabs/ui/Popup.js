class UI_Popup extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        // Set property defaults
        this.debug = this.properties.debug || false;
        this.dataPrefabs = [];

        this.cornerRadius = this.properties.cornerRadius;
        this.closeTextStyle = this.properties.closeTextStyle;
        this.closeButtonSize = this.properties.closeButtonSize;
        this.margins = this.properties.margins;
    }

    open(displayData, x, y) {
        // Reset any currently visible popups
        this.close();
        
        if (!displayData || !Object.entries(displayData).length) {
            return;
        }
        this.displayData = displayData;
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
        displayElements.forEach(item => {
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
        this.bg = this.constructor.createBgGraphics(this.game, width, height, this.cornerRadius);
        this.closeButton = this.constructor.createButton(this.game, this.closeButtonSize.x, this.closeButtonSize.y, this.cornerRadius, "x", this.closeTextStyle, this.close, this);
        this.closeButton.x = width - this.closeButtonSize.x; // place button at top-right
        this.addChild(this.bg);
        this.addChild(this.closeButton);

        this.dataPrefabs.map(prefab => {
            if (prefab.onChange && prefab.onChange.add) {
                // Refresh popup window if any content changes
                prefab.onChange.add(this.refresh, this);
            }
            this.bg.addChild(prefab);
        });
    }

    refresh() {
        // Calculate max width and height of content
        let maxWidth = 0;
        let height = this.margins.top + this.margins.bottom;
        this.dataPrefabs.forEach(prefab => {
            height += prefab.getMaxChildProperty('height');
            let prefabWidth = prefab.getMaxChildProperty('width');
            if (maxWidth < prefabWidth) {
                maxWidth = prefabWidth;
            }
        });
        maxWidth += this.margins.left + this.margins.right;

        if (this.bg.height < height || this.bg.width < maxWidth) {
            // Height or width of content increased, re-render popup
            this.open(this.displayData, this.x, this.y);
        }
    }

    close() {
        this.dataPrefabs.forEach(prefab => {
            if (prefab.onChange && prefab.onChange.removeAll) {
                prefab.onChange.removeAll();
            }
            prefab.destroy();
        });
        this.dataPrefabs = [];
        if (this.bg) {
            this.bg.destroy();
        }
        if (this.closeButton) {
            this.closeButton.destroy();
        }
        delete this.displayData;
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
        const closeButton = this.createButtonGraphics(game, width, height, cornerRadius);
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