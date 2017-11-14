class UI_ResourceTrader extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);

        this.realWidth = 0;

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0 };

        this.btnTake = this.gameState.uiFactory.textButton.create("Take", this.takeResource, this);
        this.realWidth += this.btnTake.width;
        this.addChild(this.btnTake);
        
        this.btnGive = this.gameState.uiFactory.textButton.create("Give", this.giveResource, this, this.btnTake.width + this.elementPadding.x);
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
}