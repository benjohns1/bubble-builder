class UI_GameMenu extends Prefab {

    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };

        let currentY = 0;

        // Title
        this.title = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.title, this.properties.titleStyle);
        this.addChild(this.title);
        currentY += this.title.height + this.elementPadding.y;

        // Restart button
        this.btnRestart = this.gameState.uiFactory.textButton.create(this.properties.restartLabel, this.confirmRestart, this, 0, currentY);
        this.addChild(this.btnRestart);
        currentY += this.btnRestart.height + this.elementPadding.y;

        // Respawn button
        this.btnRespawn = this.gameState.uiFactory.textButton.create(this.properties.respawnLabel, this.respawn, this, 0, currentY);
        this.addChild(this.btnRespawn);
        currentY += this.btnRespawn.height + this.elementPadding.y;
        
        // Save button
        this.btnSave = this.gameState.uiFactory.textButton.create(this.properties.saveLabel, this.save, this, 0, currentY);
        this.addChild(this.btnSave);
        currentY += this.btnSave.height + this.elementPadding.y;
        
        // Load button
        this.btnLoad = this.gameState.uiFactory.textButton.create(this.properties.loadLabel, this.load, this, 0, currentY);
        this.addChild(this.btnLoad);
        currentY += this.btnLoad.height + this.elementPadding.y;

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

    save() {
        this.openSubMenu(this.properties.saveMenu);
        this.close();
    }
    
    load() {
        this.openSubMenu(this.properties.loadMenu);
        this.close();
    }
    

    confirmRestart() {
        this.openSubMenu(this.properties.restartMenu);
        this.gameState.subMenu.listen("onConfirm", this.restart, this);
        this.close();
    }

    restart() {
        this.gameState.restart();
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