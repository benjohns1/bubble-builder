class Structure_Base extends Structure {
    
    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);
        this.updateTimer = this.properties.updateTimer || 60000;
        this.nextUpdate = this.game.time.now + this.updateTimer;
        this.updatePercentage = this.properties.updatePercentage || 0.2;

        // Update countdown
        this.updateInSeconds = 0;
        this.updateSignal = new Phaser.Signal();

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

    update() {
        if (this.game.time.now > this.nextUpdate) {
            for (let resource in this.resources.list) {
                const addAmount = Math.floor(this.resources[resource] * this.updatePercentage);
                if (addAmount <= 0) {
                    continue;
                }
                this.resources[resource] += addAmount;
            }
            this.nextUpdate += this.updateTimer;
        }

        // Update timer
        const currentSecondTimer = Math.ceil((this.nextUpdate - this.game.time.now) / 1000);
        if (currentSecondTimer !== this.updateInSeconds) {
            this.updateInSeconds = currentSecondTimer;
            this.updateSignal.dispatch();
        }
    }
}