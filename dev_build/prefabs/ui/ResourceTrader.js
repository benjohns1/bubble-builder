class UI_ResourceTrader extends Prefab {

    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        this.realWidth = 0;
        this.source = this.properties.context;
        this.player = this.gameState.player;
        this.currentResource = "energy";
        this.autoUpdate = this.properties.hasOwnProperty("autoUpdate") ? this.properties.autoUpdate : false;

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0 };

        // Take button
        this.btnTake = this.gameState.uiFactory.textButton.create("Take", this.takeResource, this, 0);
        this.realWidth += this.btnTake.width + this.elementPadding.x;
        this.addChild(this.btnTake);

        // Take input box
        this.takeAmount = this.game.add.inputField(this.realWidth, 0, {
            width: 50,
            padding: 10,
            type: PhaserInput.InputType.number
        });
        this.realWidth += this.takeAmount.width + 20 + this.elementPadding.x;
        this.addChild(this.takeAmount);

        // Select resource
        this.resource = this.gameState.uiFactory.textDropdown.create({
            "energy": "Energy",
            "green": "Green",
            "red": "Red",
            "purple": "Purple"
        }, this.currentResource, this.resourceSelected, this, this.realWidth);
        this.realWidth += this.resource.width + this.elementPadding.x;
        this.addChild(this.resource);

        // Give input box
        this.giveAmount = this.game.add.inputField(this.realWidth, 0, {
            width: 50,
            padding: 10,
            type: PhaserInput.InputType.number
        });
        this.realWidth += this.giveAmount.width + 20 + this.elementPadding.x;
        this.addChild(this.giveAmount);
        
        // Give button
        this.btnGive = this.gameState.uiFactory.textButton.create("Give", this.giveResource, this, this.realWidth);
        this.realWidth += this.btnGive.width;
        this.addChild(this.btnGive);
        
        // Listen for resource changes
        this.sourceListener = new Component_PropertyListener(this, this.properties.property, this.resourcesUpdated, this, this.properties.signal, this.source);
        this.playerListener = new Component_PropertyListener(this, this.properties.property, this.resourcesUpdated, this, this.properties.signal, this.player);

        this.resourcesUpdated();
    }

    update() {
        this.takeAmount.update();
        this.giveAmount.update();
    }

    resourcesUpdated() {
        if (!this.autoUpdate || !this.currentResource || !this.player.resources) {
            return;
        }
        const takeAmountValue = this.source.resources[this.currentResource];
        this.takeAmount.setText(takeAmountValue);

        // Keep 100 player energy
        let giveAmountValue = this.currentResource === "energy" ? Math.max(this.player.resources.energy - 100, 0) : this.player.resources[this.currentResource];

        // Clamp max amount
        const availableSpace = this.source.resources.availableSpace(this.currentResource);
        if (availableSpace < giveAmountValue) {
            giveAmountValue = availableSpace;
        }

        this.giveAmount.setText(giveAmountValue);
    }

    getWidth() {
        return this.realWidth;
    }

    takeResource() {
        if (!this.currentResource || this.takeAmount <= 0 || !this.player.resources) {
            return;
        }
        this.player.resources.takeFrom(this.source.resources, this.currentResource, this.takeAmount.value);
    }
    
    giveResource() {
        if (!this.currentResource || this.giveAmount <= 0 || !this.player.resources) {
            return;
        }
        this.source.resources.takeFrom(this.player.resources, this.currentResource, this.giveAmount.value);
    }

    resourceSelected() {
        this.currentResource = arguments[3];
        this.resourcesUpdated();
    }
}