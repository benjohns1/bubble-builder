export default class UI_StructureManager extends Prefab {

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
        const buildCost = this.source.properties.buildCost
        this.gameState.removePrefab(this.source.constructor.name, this.source.id);
        if (buildCost) {
            Object.keys(buildCost).forEach(resourceName => {
                this.player.resources.add(resourceName, buildCost[resourceName]);
            });
        }
        this.parent.parent.close();
    }
}