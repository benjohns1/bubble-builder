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
        this.selectDropdown = this.gameState.uiFactory.textDropdown.create({
            "energy": "Energy",
            "green": "Green",
            "red": "Red",
            "purple": "Purple"
        }, "Select resource", this.selectResource, this, currentX);
        this.realWidth += this.selectDropdown.width + this.elementPadding.x;
        this.addChild(this.selectDropdown);
        
        currentX += this.selectDropdown.width + this.elementPadding.x
        this.btnGive = this.gameState.uiFactory.textButton.create("Give", this.giveResource, this, currentX);
        this.realWidth += this.btnGive.width + this.elementPadding.x;
        this.addChild(this.btnGive);

        this.isOkay = "okay!";
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
        console.log('select resource', arguments, this.isOkay);
    }
}