class UI_Popup extends Prefab {

    constructor(gameState, name, x, y, properties = {}) {
        super(gameState, name, x, y, properties);
        // Set property defaults
        this.debug = this.properties.debug || false;
        this.dataPrefabs = [];
        this.margins = this.properties.margins || { "top": 0, "right": 0, "bottom": 0, "left": 0 };
        this.showCloseButton = (this.properties.closeButtonSize && this.properties.closeButtonSize.x > 0);
        this.fixedToCamera = this.properties.fixedToCamera || false;
        this.opened = false;
    }

    open(displayData, x = 0, y = 0) {

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
            // Create each element prefab for UI
            const name = item[0], element = item[1];
            let prefab = this.gameState.prefabFactory(element.prefabType, name, elementX, elementY, element.properties);
            this.dataPrefabs.push(prefab);
            elementY += prefab.getHeight();
            let prefabWidth = prefab.getWidth();
            if (maxWidth < prefabWidth) {
                maxWidth = prefabWidth;
            }
        });

        // Create generic window graphics
        const width = Math.max(maxWidth, (this.showCloseButton ? this.properties.closeButtonSize.x : 0)) + this.margins.left + this.margins.right;
        const height = Math.max(elementY, (this.showCloseButton ? this.properties.closeButtonSize.y : 0)) + this.margins.bottom;
        this.bg = this.constructor.createBgGraphics(this.game, width, height, this.properties.cornerRadius);
        this.addChild(this.bg);
        
        if (this.showCloseButton) {
            this.closeButton = this.gameState.uiFactory.textButton.create("x", this.close, this, width - this.properties.closeButtonSize.x, 0, this.properties.closeButtonSize.x, this.properties.closeButtonSize.y, this.properties.cornerRadius, this.properties.closeTextStyle, this.properties.closeTextPadding, this.properties.closeTextOffset);
            this.addChild(this.closeButton);
        }

        this.dataPrefabs.map(prefab => {
            if (prefab.onChange && prefab.onChange.add) {
                // Refresh popup window if any content changes
                prefab.onChange.add(this.refresh, this);
            }
            this.bg.addChild(prefab);
        });
        this.opened = true;
    }

    refresh() {
        // Calculate max width and height of content
        let maxWidth = 0;
        let height = this.margins.top + this.margins.bottom;
        this.dataPrefabs.forEach(prefab => {
            height += prefab.getHeight();
            let prefabWidth = prefab.getWidth();
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
        this.opened = false;
    }

    center() {
        let fixedToCamera = false;
        if (this.fixedToCamera) {
            this.fixedToCamera = false;
            fixedToCamera = true;
        }
        this.x = (this.game.camera.width / 2) - (this.bg.width / 2);
        this.y = (this.game.camera.height / 2) - (this.bg.height / 2);
        this.fixedToCamera = fixedToCamera;
    }
    
    static createBgGraphics(game, width, height, cornerRadius) {

        // Draw bg
        const g = new Phaser.Graphics(game);
        g.beginFill(0xffffff);
        g.drawRoundedRect(0, 0, width, height, cornerRadius);
        g.endFill();

        return g;
    }
}