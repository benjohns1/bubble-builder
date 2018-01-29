export default class Player extends Prefab {
    
    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        this.debug = this.properties.debug || false;
        this.color = Phaser.Color.hexToRGB(properties.color || "#3916a0");
        this.allowMovement = true;
        let _displaySize = 0;
        this.onChange = new Phaser.Signal();
        Object.defineProperty(this, "displaySize", {
            get: () => _displaySize,
            set: value => {
                const changed = (value !== _displaySize);
                _displaySize = value;
                if (changed) {
                    this.onChange.dispatch();
                }
            }
        });

        // Level energy => size curve
        this.levelCurve = {
            "xOffset": 4,
            "yOffset": 0,
            "multiplier": 3,
            "exp": 3
        };
        this.levelCurve.root = 1.0 / this.levelCurve.exp;
        this.levelCurve.run = (x) => {
            // ( ((x + xOffset) / multiplier) ^ (1/exp) ) + yOffset
            return Math.pow((x + this.levelCurve.xOffset) / this.levelCurve.multiplier, this.levelCurve.root) + this.levelCurve.yOffset;
        };
        this.levelCurve.reverse = (x) => {
            // Opposite of levelCurve run function
            // multiplier * ((x - yOffset) ^ exp) - xOffset
            return this.levelCurve.multiplier * Math.pow(x - this.levelCurve.yOffset, this.levelCurve.exp) - this.levelCurve.xOffset;
        };

        this.baseSize = 10;
        // Player size => size scalar curve
        this.sizeCurve = {
            "xOffset": -1,
            "yOffset": 1,
            "multiplier": 1,
            "exp": 0.7
        };
        this.sizeCurve.run = (x) => {
            // ( (multiplier * (x + xOffset)) ^ exp ) + yOffset
            return Math.pow(this.sizeCurve.multiplier * (x + this.sizeCurve.xOffset), this.sizeCurve.exp) + this.sizeCurve.yOffset;
        };

        this.resources = this.gameState.componentFactory("Component_ResourceContainer", this);
        this.init();
        this.resources.onChange.add(this.updateEnergy, this);

        // Input bindings
        this.keys = this.game.input.keyboard.addKeys({
            up: Phaser.KeyCode.W,
            down: Phaser.KeyCode.S,
            left: Phaser.KeyCode.A,
            right: Phaser.KeyCode.D,
            brake: Phaser.KeyCode.SHIFT,
            menu: Phaser.KeyCode.ESC
        });
        this.keys.menu.onUp.add(this.gameState.toggleGameMenu, this.gameState);
        
        // Create graphics and setup physics
        this.player = Player.createGraphics(this.game, this.baseSize, this.color);
        this.physicsId = Player.setupPhysics(this.game, this, this.baseSize, this.damping, this.debug);
        this.addChild(this.player);

        // Eat food
        this.body.onBeginContact.add(this.collisionHandler, this);
        
        this.updateEnergy(false, true);
    }

    kill(deathMessage = "You died") {
        this.gameState.notify.death(deathMessage);
        
        this.gameState.spawnPlayerCorpse(this); // drop all resources
        this.allowMovement = false;

        // Reset properties to clean state for re-initialization
        delete this.properties.resources;
    }

    respawn(x, y) {
        this.kill("You committed suicide");
        this.init(true);
        this.updateEnergy(false, true);

        this.body.x = x;
        this.body.y = y;
        this.allowMovement = true;
    }

    init() {
        this.updateSizeImmediately = true;
        this.initialResources = this.properties.hasOwnProperty("initialResources") ? this.properties.initialResources : {
            energy: 10
        };
        let resources = this.properties.hasOwnProperty("resources") ? this.properties.resources : this.initialResources;
        this.resources.reset(resources);
        this.updateSizeImmediately = false;
        this.speed = this.properties.hasOwnProperty("speed") ? this.properties.speed : 100;
        this.damping = this.properties.hasOwnProperty("damping") ? this.properties.damping : 0.5;
        this.updateThreshold();
    }
    
    getState() {
        const state = super.getState();

        // Add current properties, for serialization
        Phaser.Utils.extend(true, state.factoryArgs.properties, {
            "resources": this.resources.list,
            "speed": this.speed,
            "damping": this.damping
        });
        return state;
    }
    
    static createGraphics(game, radius, color) {

        // Draw player
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

    collisionHandler(body) {

        if (!body || !body.data || !body.data.id) {
            return;
        }

        // Check for floater collision
        this.floaterCollisionHandler(body.data.id);
    }

    buildStructure(name, x, y) {

        // Get structure data
        const structureData = this.gameState.assetData.structures[name];
        if (!structureData) {
            this.gameState.notify.error("Invalid structure to build");
            throw new Exception("Invalid structure " + name);
        }

        // Remove resources from player
        if (!this.gameState.freeBuild && !this.resources.removeResources(structureData.properties.buildCost)) {
            this.gameState.notify.warn("Not enough resources to build " + (structureData.properties.lcTitle ? structureData.properties.lcTitle : name));
            return false;
        }

        // Spawn structure
        return this.gameState.prefabFactory(structureData.prefabType, name, x, y, structureData.properties);
    }

    floaterCollisionHandler(physicsId) {

        // Find floater by physics body ID
        let floater = this.gameState.getFloater(physicsId);        
        if (floater === undefined) {
            return false;
        }

        if (floater.radius < this.radius && floater.resources) {
            this.resources.takeAllFrom(floater.resources);
    
            // Destroy floater
            this.gameState.removeFloater(floater.id);
        }
    }

    updateEnergy(animate = true, force = false) {
        
        // Check if energy is less than 0
        if (this.resources.energy <= 0) {
            this.kill();
        }

        // Find exact size from curve
        const exactSize = this.levelCurve.run(this.resources.energy);
        const newSize = Math.floor(exactSize); // Floor to nearest integer

        if (!force && this.size === newSize) {
            // Size didn't change, just update display energy and return
            this.displayEnergyThreshold = this.resources.energy + " / " + this.nextEnergyThreshold;
            return;
        }
        
        // Change player size
        this.setSize(newSize, animate);
    }

    updateThreshold() {
        this.nextEnergyThreshold = this.levelCurve.reverse(this.size + 1);
    }

    setSize(newSize, animate = true) {
        this.size = newSize;

        // Update threshold to next level
        this.updateThreshold();
        this.displayEnergyThreshold = this.resources.energy + " / " + this.nextEnergyThreshold;

        // Check whether to skip animation
        animate = this.updateSizeImmediately ? false : animate;
        this.updateSizeImmediately = false;
        
        // Run size curve
        const scalar = this.sizeCurve.run(newSize);

        // Calculate new scale and radii for components
        const newScale = { x: scalar, y: scalar }
        const newRadius = this.baseSize * scalar;
        const newBodyRadius = 0.05 * newRadius; // Adjust for different P2 physics unit

        if (animate) {
            // Animation tween
            const duration = 1000;
            const ease = Phaser.Easing.Sinusoidal.In;

            this.game.add.tween(this.player.scale).to( newScale, duration, ease, true);
            this.game.add.tween(this).to( { displaySize: newSize } , duration, ease, true);
            this.game.add.tween(this).to( { radius: newRadius } , duration, ease, true);
            this.game.add.tween(this.body.data.shapes[0]).to( { radius: newBodyRadius }, duration, ease, true);
        }
        else {
            // Set immediately
            this.player.scale = newScale;
            this.displaySize = newSize;
            this.radius = newRadius;
            this.body.data.shapes[0].radius = newBodyRadius;
        }
    }

    update() {

        // Brake
        let speedMultiplier = 1.0;
        if (this.keys.brake.isDown) {
            this.body.damping = 0.95;
            speedMultiplier = 0.5;
        }
        else {
            this.body.damping = this.damping;
        }

        if (!this.allowMovement) {
            return;
        }
        
        // Movement controls
        if (this.keys.left.isDown && !this.keys.right.isDown) {
            this.body.moveLeft(this.speed * speedMultiplier);
        }
        if (this.keys.right.isDown && !this.keys.left.isDown) {
            this.body.moveRight(this.speed * speedMultiplier);
        }
        if (this.keys.up.isDown && !this.keys.down.isDown) {
            this.body.moveUp(this.speed * speedMultiplier);
        }
        if (this.keys.down.isDown && !this.keys.up.isDown) {
            this.body.moveDown(this.speed * speedMultiplier);
        }
    }
}