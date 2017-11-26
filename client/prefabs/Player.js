class Player extends Prefab {
    
    constructor(gameState, x, y, debug) {
        super(gameState, "player", x, y, {});

        this.gameState = gameState;
        this.debug = false;
        this.color = 0x3916a0;
        this.freeBuild = true;
        this.allowMovement = true;
        let _radius = 0;
        this.onChange = new Phaser.Signal();
        Object.defineProperty(this, "radius", {
            get: () => _radius,
            set: value => {
                if (value !== _radius) {
                    this.onChange.dispatch();
                }
                _radius = value;
            }
        });
        this.lastEnergyThreshold = 0;
        this.speed = 0;
        this.damping = 0;
        this.initialResources = {
            energy: 10
        };
        this.resources = new Component_ResourceContainer(this, this.initialResources);
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
        this.player = Player.createGraphics(this.game, this.radius, this.color);
        this.id = Player.setupPhysics(this.game, this, this.radius, this.damping, this.debug);
        this.addChild(this.player);

        // Eat food
        this.body.onBeginContact.add(this.collisionHandler, this);
        
        this.updateEnergy();
    }

    kill() {
        console.log("player died");
        // @TODO: drop all resources
        console.log("drop loot", this.resources.list);
        this.allowMovement = false;
    }

    respawn(x, y) {
        this.kill();
        this.init();

        this.body.x = x;
        this.body.y = y;
        this.allowMovement = true;

        this.updateEnergy();
    }

    init() {
        this.resources.reset(this.initialResources);
        this.radius = 10;
        this.lastEnergyThreshold = 10;
        this.speed = 100;
        this.damping = 0.5;
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
        this.floaterCollisionHandler(body);
    }

    buildStructure(name, x, y) {

        // Get structure data
        const structureData = this.gameState.assetData.structures[name];
        if (!structureData) {
            throw new Exception("Invalid structure " + name);
        }

        // Remove resources from player
        if (!this.freeBuild && !this.resources.removeResources(structureData.properties.buildCost)) {
            console.warn("Cannot build, not enough resources");
            return false;
        }

        // Spawn structure
        return this.gameState.spawnStructure(structureData.prefabType, name, x, y, structureData.properties);
    }

    floaterCollisionHandler(body) {
        if (!this.gameState.floaters[body.data.id]) {
            return false;
        }

        let floater = this.gameState.floaters[body.data.id];
        if (floater.radius < this.radius && floater.resources) {
            this.resources.takeAllFrom(floater.resources);
    
            // Destroy floater
            this.gameState.removeFloater(floater.id);
            floater.destroy();
            floater = null;
        }
    }

    updateEnergy() {
        
        // Check if energy is less than 0
        if (this.resources.energy < 0) {
            console.warn('game over');
        }

        // Check if grow/shrink threshold has been crossed
        let multiplier = 1.0;
        let updateThreshold = function(self) {
            if (self.resources.energy >= self.lastEnergyThreshold * 2) {
                multiplier *= 1.25;
                self.lastEnergyThreshold *= 2;
                return true;
            }
            else if (self.resources.energy < self.lastEnergyThreshold / 2) {
                multiplier *= 0.8;
                self.lastEnergyThreshold /= 2;
                return true;
            }
            return false;
        }

        while (updateThreshold(this)) {} // keep updating threshold until it's done

        // Change player size if needed
        if (this.game.math.roundTo(multiplier, -1) != 1.0) {
            this.changeSize(multiplier);
        }

        // Update stat display
        this.displayEnergyThreshold = this.resources.energy + " / " + this.lastEnergyThreshold * 2;
    }

    changeSize(multiplier) {
        const duration = 1000;
        const ease = Phaser.Easing.Sinusoidal.In;

        const newScale = this.player.scale.x * multiplier;
        const newBodyRadius = this.body.data.shapes[0].radius * multiplier;
        const newRadius = this.radius * multiplier;
        this.game.add.tween(this.player.scale).to( { x: newScale, y: newScale }, duration, ease, true);
        this.game.add.tween(this.body.data.shapes[0]).to( { radius: newBodyRadius }, duration, ease, true);
        this.game.add.tween(this).to( { radius: newRadius }, duration, ease, true);
        return newRadius;
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