class Prefab extends Phaser.Sprite {

    constructor(gameState, name, x, y, properties) {
        super(gameState.game, x, y, properties.texture);
        this.gameState = gameState;
        this.name = name;
        this.properties = properties || {};
        this.debug = this.properties.debug || false;

        // Add special displayData property
        this.displayData = {};
        if (this.properties.displayData) {
            this.displayData = Object.entries(this.properties.displayData).reduce((data, entry) => {
                let entryData = entry[1];
                if (!entryData.properties) {
                    entryData.properties = {};
                }
                if (!entryData.properties.context) {
                    entryData.properties.context = this;
                }
                data[entry[0]] = entryData;
                return data;
            }, {});
        }

        // Apply generic sprite prefab properties
        if (this.properties.scale) {
            this.scale.setTo(this.properties.scale.x, this.properties.scale.y);
        }
        if (this.properties.anchor) {
            this.anchor.setTo(this.properties.anchor.x, this.properties.anchor.y);
        }

        this.game.add.existing(this);
        if (!this.gameState.prefabs) {
            this.gameState.prefabs = {};
        }
        this.gameState.prefabs[name] = this;
    }

    destroy() {
        delete this.gameState.prefabs[name];
        super.destroy();
    }

    getWidth() {
        return this.getMaxChildProperty('width');
    }

    getHeight() {
        return this.getMaxChildProperty('height');
    }

    getMaxChildProperty(prop) {
        return this.children.reduce((maxValue, child) => {
            if (child[prop] > maxValue) {
                return child[prop];
            }
            return maxValue;
        }, 0);
    }
}