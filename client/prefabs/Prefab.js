class Prefab extends Phaser.Sprite {

    constructor(gameState, name, x, y, properties) {
        super(gameState.game, x, y, (properties ? properties.texture : 'empty'));
        this.gameState = gameState;
        this.name = name;
        this.properties = properties || {};

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

    getMaxChildProperty(prop) {
        return this.children.reduce((maxValue, child) => {
            if (child[prop] > maxValue) {
                return child[prop];
            }
            return maxValue;
        }, 0);
    }
}