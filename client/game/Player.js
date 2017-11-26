class Player extends Phaser.Group {
    
    constructor(gameState, x, y, debug) {
        super(gameState.game);
        this.gameState = gameState;
        this.debug = false;
        this.color = 0x3916a0;
        //this.outlineColor = 0x51efe7;
        this.startingPoint = {
            x: x,
            y: y
        };
        this.freeBuild = true;
        let _radius = 10;
        Object.defineProperty(this, "radius", {
            get: () => _radius,
            set: value => {
                if (value !== _radius) {
                    this.onChange.dispatch();
                }
                _radius = value;
            }
        });
        this.speed = 100;
        this.damping = 0.5;
        this.resources = new Component_ResourceContainer(this, {
            energy: 10
        });

        this.resources.onChange.add(this.updateEnergy, this);
        this.onChange = new Phaser.Signal();

        this.lastEnergyThreshold = 10;

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
        
        // Player
        this.player = this.createPlayerGraphics(this.startingPoint.x, this.startingPoint.y, this.radius);

        // Eat food
        this.player.body.onBeginContact.add(this.collisionHandler, this);

        this.updateEnergy();
    }

    respawn() {
        console.log('rspawn');
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

    createPlayerGraphics(x, y, radius) {

        // Draw player
        const player = this.game.add.graphics(x, y);
        //player.lineStyle(1, this.outlineColor);
        player.beginFill(this.color);
        player.drawCircle(0, 0, radius * 2);
        player.endFill();
        this.add(player);

        this.setupPlayerPhysics(player, radius);
        player.anchor.setTo(0.5);

        return player;
    }

    setupPlayerPhysics(player, radius) {

        // Enable physics
        this.game.physics.p2.enableBody(player, this.debug);
        player.body.setCircle(radius);
        player.body.damping = this.damping;
    }

    changeSize(multiplier) {
        const duration = 1000;
        const ease = Phaser.Easing.Sinusoidal.In;

        const newScale = this.player.scale.x * multiplier;
        const newBodyRadius = this.player.body.data.shapes[0].radius * multiplier;
        const newRadius = this.radius * multiplier;
        this.game.add.tween(this.player.scale).to( { x: newScale, y: newScale }, duration, ease, true);
        this.game.add.tween(this.player.body.data.shapes[0]).to( { radius: newBodyRadius }, duration, ease, true);
        this.game.add.tween(this).to( { radius: newRadius }, duration, ease, true);
        return newRadius;
    }

    update() {

        // Brake
        let speedMultiplier = 1.0;
        if (this.keys.brake.isDown) {
            this.player.body.damping = 0.95;
            speedMultiplier = 0.5;
        }
        else {
            this.player.body.damping = this.damping;
        }
        
        // Movement controls
        if (this.keys.left.isDown && !this.keys.right.isDown) {
            this.player.body.moveLeft(this.speed * speedMultiplier);
        }
        if (this.keys.right.isDown && !this.keys.left.isDown) {
            this.player.body.moveRight(this.speed * speedMultiplier);
        }
        if (this.keys.up.isDown && !this.keys.down.isDown) {
            this.player.body.moveUp(this.speed * speedMultiplier);
        }
        if (this.keys.down.isDown && !this.keys.up.isDown) {
            this.player.body.moveDown(this.speed * speedMultiplier);
        }
    }
}