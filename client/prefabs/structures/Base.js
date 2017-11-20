
class Structure_Base extends Structure {
    
    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        this.updateTimer = this.properties.updateTimer || 10000;
        this.nextUpdate = this.game.time.now + this.updateTimer;
        this.energyAmount = this.properties.energyAmount || 10;

        // Deep-copy initial resources to this instance
        this.resources = new Component_ResourceContainer(this, this.properties.initialResources, this.properties.resourceLimits);
        this.resources.onChange.add(this.updateDisplayData, this);

        this.displayTitle = this.properties.title;
        this.displayResources = {};
        this.updateDisplayData();
    }

    update() {
        if (this.game.time.now > this.nextUpdate) {
            this.resources.energy += this.energyAmount;
            this.nextUpdate += this.updateTimer;
        }
    }

    updateDisplayData() {
        for (let resourceName in this.resources.list) {
            this.displayResources[resourceName] = this.resources[resourceName] + " / " + this.properties.resourceLimits[1];
        }
    }
}