
class Structure_Base extends Structure {
    
    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        this.updateTimer = this.properties.updateTimer || 10000;
        this.nextUpdate = this.game.time.now + this.updateTimer;
        this.energyAmount = this.properties.energyAmount || 10;
        this.maxEnergy = this.properties.maxEnergy || 100;

        // Deep-copy initial resources to this instance
        this.resources = {
            energy: 0
        };
        Phaser.Utils.extend(true, this.resources, this.properties.initialResources);

        this.displayTitle = this.name;
        this.displayEnergy = this.resources.energy + " / " + this.maxEnergy;
    }

    update() {
        if (this.game.time.now > this.nextUpdate) {
            this.resources.energy += this.energyAmount;
            if (this.resources.energy > this.maxEnergy) {
                this.resources.energy = this.maxEnergy;
            }
            this.displayEnergy = this.resources.energy + " / " + this.maxEnergy;
            this.nextUpdate += this.updateTimer;
        }
    }

    getDisplayData() {
        return {
            "title": {
                "prefabType": "UI_StatText",
                "properties": {
                    "statContext": this,
                    "stat": [ "displayTitle" ]
                }
            },
            "energy": {
                "prefabType": "UI_StatText",
                "properties": {
                    "statContext": this,
                    "stat": [ "displayEnergy" ],
                    "label": "Energy: "
                }
            },
        }
    }
}