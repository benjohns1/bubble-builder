class Structure extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);

        // Set property defaults
        this.debug = this.properties.debug || false;
        this.color = Phaser.Color.hexToRGB(this.properties.color || "#ffffff");

        // Create graphics and setup physics
        this.structure = Structure.createGraphics(this.game, this.anchor, this.properties.width, this.properties.height, this.color);
        this.id = Structure.setupPhysics(this.game, this, this.properties.width, this.properties.height, this.debug);
        this.addChild(this.structure);

        // Enable input for this structure
        this.structure.inputEnabled = true;
        this.structure.events.onInputDown.add(this.onInputDown, this);
    }

    onInputDown(displayObject, pointer) {
        const findDisplayData = function(obj) {
            if (obj.getDisplayData) {
                return obj.getDisplayData();
            }
            if (!obj.parent) {
                return null;
            }
            return findDisplayData(obj.parent); // recursively look higher up chain
        }
        this.gameState.popupWindow.open(findDisplayData(displayObject), pointer.x + this.game.camera.x, pointer.y + this.game.camera.y);
    }
    
    static createGraphics(game, parentAnchor, width, height, color, alpha = 1.0) {

        // Adjust draw location based on parent anchor
        const x = game.math.linear(0, -width, parentAnchor.x);
        const y = game.math.linear(0, -height, parentAnchor.y);

        // Draw structure
        const g = new Phaser.Graphics(game);
        g.beginFill(color, alpha);
        g.drawRoundedRect(x, y, width, height, 5);
        g.endFill();

        return g;
    }

    static setupPhysics(game, physicsObject, width, height, debug) {

        // Enable physics
        game.physics.p2.enableBody(physicsObject, debug);
        physicsObject.body.setRectangle(width, height, width / 2, height / 2);
        physicsObject.body.static = true; // structures are immovable

        return physicsObject.body.data.id;
    }
}