
class Structure_Base extends Structure {
    
    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);
        this.updateTimer = this.properties.updateTimer || 10000;
        this.nextUpdate = this.game.time.now + this.updateTimer;
        this.energyAmount = this.properties.energyAmount || 10;

        // Deep-copy initial resources to this instance

        this.resources = this.gameState.componentFactory("Component_ResourceContainer", this, this.properties.resources || this.properties.initialResources, this.properties.resourceLimits);
        this.resources.onChange.add(this.updateDisplayData, this);

        this.displayTitle = this.properties.title + " " + this.id;
        this.displayResources = {};
        this.updateDisplayData();
    }
    
    getState() {
        const state = super.getState();

        // Add current properties, for serialization
        Phaser.Utils.extend(true, state.factoryArgs.properties, {
            "radius": this.radius,
            "resources": this.resources.list
        });
        return state;
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