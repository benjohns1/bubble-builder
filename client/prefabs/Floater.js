class Floater extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);
        
        // Interpolation value to choose between spread values
        this.spreadInterpolation = Math.random();

        // Choose radius value
        this.minRadius = this.properties.radiusSpread ? this.properties.radiusSpread[0] : 0;
        this.maxRadius = this.properties.radiusSpread ? this.properties.radiusSpread[1] : 100;
        this.radius = Math.ceil(game.math.linear(this.minRadius, this.maxRadius, this.spreadInterpolation));

        // Choose resource values
        const chooseResourceSpread = (acc, prop) => {
            let key = prop[0], min = prop[1][0], max = prop[1][1];
            acc[key] = Math.ceil(game.math.linear(min, max, this.spreadInterpolation));
            return acc;
        };
        if (this.properties.resourceSpread) {
            this.resources = new Component_ResourceContainer(this, Object.entries(this.properties.resourceSpread).reduce(chooseResourceSpread, {}));
        }

        // Set property defaults
        this.damping = this.properties.damping || 0.5;
        this.debug = this.properties.debug || false;
        this.color = Phaser.Color.hexToRGB(this.properties.color || "#ffffff");

        // Create graphics and setup physics
        this.floater = Floater.createGraphics(this.game, this.radius,this.color);
        this.id = Floater.setupPhysics(this.game, this, this.radius, this.damping, this.debug);
        this.addChild(this.floater);
    }
    
    static createGraphics(game, radius, color) {

        // Draw circle
        const g = new Phaser.Graphics(game);
        g.beginFill(color);
        g.drawCircle(0, 0, radius * 2);
        g.endFill();

        return g;
    }

    static setupPhysics(game, physicsObject, radius, damping, debug) {

        // Enable physics
        game.physics.p2.enableBody(physicsObject, debug);
        physicsObject.body.setCircle(radius);
        physicsObject.body.damping = damping;

        return physicsObject.body.data.id;
    }
}