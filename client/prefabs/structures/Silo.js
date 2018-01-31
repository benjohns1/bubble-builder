class Structure_Silo extends Structure {
    
    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        // Deep-copy initial resources to this instance
        this.resources = this.gameState.componentFactory("Component_ResourceContainer", this, this.properties.resources || this.properties.initialResources, this.properties.resourceLimits);

        this.displayTitle = this.properties.title + " " + this.id;
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
}