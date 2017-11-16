class UI_ResourceTrader extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);

        this.realWidth = 0;

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0 };

        let currentX = 0;
        this.btnTake = this.gameState.uiFactory.textButton.create("Take", this.takeResource, this, currentX);
        this.realWidth += this.btnTake.width;
        this.addChild(this.btnTake);
        
        currentX += this.btnTake.width + this.elementPadding.x;
        this.btnSelect = this.gameState.uiFactory.textDropdown.create("Resource", this.selectResource, this, currentX);
        this.realWidth += this.btnSelect.width + this.elementPadding.x;
        this.addChild(this.btnSelect);
        
        currentX += this.btnSelect.width + this.elementPadding.x
        this.btnGive = this.gameState.uiFactory.textButton.create("Give", this.giveResource, this, currentX);
        this.realWidth += this.btnGive.width + this.elementPadding.x;
        this.addChild(this.btnGive);
    }

    getWidth() {
        return this.realWidth;
    }

    takeResource() {
        console.log('take resource');
    }
    
    giveResource() {
        console.log('give resource');
    }
    
    selectResource() {
        console.log('select resource');
    }
}