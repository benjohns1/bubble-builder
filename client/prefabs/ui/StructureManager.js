class UI_StructureManager extends Prefab {

    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        this.realWidth = 0;
        this.source = this.properties.context;
        this.player = this.gameState.player;
        this.currentResource = "energy";

        // Set property defaults
        this.elementPadding = this.properties.elementPadding || { "x": 0 };

        // Deconstruct button
        this.btnDeconstruct = this.gameState.uiFactory.textButton.create("Deconstruct", this.deconstruct, this, 0);
        this.realWidth += this.btnDeconstruct.width + this.elementPadding.x;
        this.addChild(this.btnDeconstruct);
    }

    getWidth() {
        return this.realWidth;
    }

    deconstruct() {
        this.player.resources.takeAllFrom(this.source.resources);
        if (this.source.properties.buildCost) {
            Object.keys(this.source.properties.buildCost).forEach(resourceName => {
                this.player.resources.add(resourceName, this.source.properties.buildCost[resourceName]);
                this.source.properties.buildCost[resourceName] = 0; // just in case structure is not destroyed successfully
            });
        }
        this.gameState.removePrefab(this.source.constructor.name, this.source.id);
        this.parent.parent.close();
    }
}