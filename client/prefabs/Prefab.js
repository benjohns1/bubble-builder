class Prefab extends Phaser.Sprite {

    constructor(gameState, name, x, y, properties) {
        super(gameState.game, x, y, (properties ? properties.texture : 'empty'));
        this.gameState = gameState;
        this.name = name;
        this.properties = properties || {};

        // Apply generic sprite prefab properties
        if (properties.scale) {
            this.scale.setTo(properties.scale.x, properties.scale.y);
        }
        if (properties.anchor) {
            this.anchor.setTo(properties.anchor.x, properties.anchor.y);
        }

        this.gameState.game.add.existing(this);
        if (!this.gameState.prefabs) {
            this.gameState.prefabs = {};
        }
        this.gameState.prefabs[name] = this;
    }

    destroy() {
        delete this.gameState.prefabs[name];
        super.destroy();
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