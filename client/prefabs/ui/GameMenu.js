class UI_GameMenu extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };

        let currentY = 0;

        // Title
        this.title = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.title, this.properties.titleStyle);
        this.addChild(this.title);
        currentY += this.title.height + this.properties.elementPadding.y;

        // Respawn button
        this.btnRespawn = this.gameState.uiFactory.textButton.create(this.properties.respawnLabel, this.respawn, this, 0, currentY);
        this.addChild(this.btnRespawn);
        currentY += this.btnRespawn.height + this.properties.elementPadding.y;

        // Resume button
        this.btnResume = this.gameState.uiFactory.textButton.create(this.properties.resumeLabel, this.close, this, 0, currentY);
        this.addChild(this.btnResume);

        // Center all controls
        const centerX = this.getWidth() / 2;
        this.children.forEach(child => {
            child.x = centerX - (child.width / 2);
        });

        this.realHeight = currentY + this.btnResume.height;
    }

    respawn() {
        this.openSubMenu(this.properties.respawnMenu);
        this.close();
    }

    openSubMenu(displayData) {
        this.gameState.subMenu.open(displayData);
        this.gameState.subMenu.center();
    }

    close() {
        this.gameState.gameMenu.visible = false;
    }

    getHeight() {
        return this.realHeight;
    }
}