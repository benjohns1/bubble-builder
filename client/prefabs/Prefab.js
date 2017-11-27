class Prefab extends Phaser.Sprite {

    constructor(gameState, name, x, y, properties) {
        super(gameState.game, x, y, properties.texture);
        this.gameState = gameState;
        this.name = name;
        this.properties = properties || {};
        this.debug = this.properties.debug || false;

        // Add special displayData property
        this.displayData = {};

        // Apply generic sprite prefab properties
        if (this.properties.scale) {
            this.scale.setTo(this.properties.scale.x, this.properties.scale.y);
        }
        if (this.properties.anchor) {
            this.anchor.setTo(this.properties.anchor.x, this.properties.anchor.y);
        }

        this.game.add.existing(this);

        // State save/load settings
        this.saveFields = []; // additional basic fields to serialize
    }

    loadDisplayData() {
        if (this.properties.displayData) {
            this.displayData = Object.entries(this.properties.displayData).reduce((data, entry) => {
                let entryData = {};
                Phaser.Utils.extend(true, entryData, entry[1]);
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
    }

    destroy() {
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

    getState() {

        const state = {
            "factoryArgs": {
                "prefabType": this.constructor.name,
                "name": this.name,
                "x": this.x,
                "y": this.y,
                "properties": {}
            },
            "fields": {}
        };
        Phaser.Utils.extend(true, state.factoryArgs.properties, this.properties);

        // Serialize basic fields
        for (let i in this.serializeFields) {
            let key = this.serializeFields[i];
            state.fields[key] = this[key];
        }

        return state;
    }

    static loadFromState(gameState, state) {
        const args = state.factoryArgs;

        // Instantiate prefab class
        const instance = gameState.prefabFactory(args.prefabType, args.name, args.x, args.y, args.properties);

        // Deserialize basic fields
        for (let i in state.fields) {
            instance[i] = state.fields[i];
        }

        return instance;
    }
}