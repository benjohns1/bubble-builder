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
        this.radius = 10;
        this.speed = 100;
        this.damping = 0.5;
        this.resource = new Component_ResourceContainer(this, {
            energy: 10
        });
        let temp = new Component_ResourceContainer(this, {
            energy: 100
        });
        this.resource.takeFrom(temp, 'energy');
        console.log(this.resource.list);
        this.resource.add('green', 500);
        this.resource.list.energy += 20;
        console.log(this.resource.list);
        console.log("TODO: finish migrating to ResourceContainer");
        
        this.resources = {
            energy: 10,
            green: 0,
            red: 0,
            purple: 0
        };
        this.lastEnergyThreshold = 10;

        // Input bindings
        this.wasdKeys = this.game.input.keyboard.addKeys({
            up: Phaser.KeyCode.W,
            down: Phaser.KeyCode.S,
            left: Phaser.KeyCode.A,
            right: Phaser.KeyCode.D,
            brake: Phaser.KeyCode.SHIFT
        });
        
        // Player
        this.player = this.createPlayerGraphics(this.startingPoint.x, this.startingPoint.y, this.radius);

        // Eat food
        this.player.body.onBeginContact.add(this.collisionHandler, this);

        this.updateEnergy();
    }

    collisionHandler(body) {

        if (!body || !body.data || !body.data.id) {
            return;
        }

        // Check for floater collision
        this.floaterCollisionHandler(body);

        // Check for structure collision
        this.structureCollisionHandler(body);
    }

    addResource(fromEntity, type) {
        
        if (!fromEntity.resources[type]) {
            return false;
        }
        this.resources[type] += fromEntity.resources[type];
        fromEntity.resources[type] = 0;
        if (type === "energy") {
            this.updateEnergy();
        }
        return true;
    }

    removeResource(type, amount, allOrNone) {

        // Unknown resource or no resource
        if (!this.resources[type]) {
            return 0;
        }

        // Full amount available, remove entire amount
        if (this.resources[type] >= amount) {
            this.resources[type] -= amount;
            if (type === "energy") {
                this.updateEnergy();
            }
            return amount;
        }

        // Only a portion of amount available, don't remove any
        if (allOrNone) {
            return 0;
        }

        // Only a portion of the amount was available, remove what's available
        const amountRemoved = this.resources[type];
        this.resources[type] = 0;
        if (type === "energy") {
            this.updateEnergy();
        }
        return amountRemoved;
    }

    hasResource(type, amount) {
        return this.resources[type] >= amount;
    }
    
    addResources(fromEntity) {
        const resourceList = Object.keys(fromEntity.resources);
        resourceList.forEach(resourceName => {
            this.addResource(fromEntity, resourceName);
        });
    }

    removeResources(resources) {
        const resourceList = Object.entries(resources);
        const notEnough = resourceList.some(resource => {
            return !this.hasResource(resource[0], resource[1]);
        });
        if (notEnough) {
            return false;
        }
        resourceList.forEach(resource => {
            if (this.removeResource(resource[0], resource[1]) !== resource[1]) {
                throw new Exception("Error removing resource " + JSON.stringify(resource));
            }
        });
        return true;
    }

    buildStructure(name, x, y) {

        // Get structure data
        const structureData = this.gameState.assetData.structures[name];
        if (!structureData) {
            throw new Exception("Invalid structure " + name);
        }

        // Remove resources from player
        if (!this.freeBuild && !this.removeResources(structureData.properties.buildCost)) {
            console.log("Cannot build, not enough resources");
            return false;
        }

        // Spawn structure
        return this.gameState.spawnStructure(structureData.prefabType, name, x, y, structureData.properties);
    }

    structureCollisionHandler(body) {
        if (!this.gameState.structures[body.data.id]) {
            return false;
        }

        let structure = this.gameState.structures[body.data.id];
        if (structure.resources) {
            this.addResources(structure);
        }
    }

    floaterCollisionHandler(body) {
        if (!this.gameState.floaters[body.data.id]) {
            return false;
        }

        let floater = this.gameState.floaters[body.data.id];
        if (floater.radius < this.radius) {
            this.addResources(floater);
    
            // Destroy floater
            this.gameState.removeFloater(floater.id);
            floater.destroy();
            floater = null;
        }
    }

    updateEnergy() {

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

    changeSize(multiplier, duration, ease, onCompleteCallback) {
        duration = duration || 1000;
        ease = ease || Phaser.Easing.Sinusoidal.In;
        const newScale = this.player.scale.x * multiplier;
        const newBodyRadius = this.player.body.data.shapes[0].radius * multiplier;
        const newRadius = this.radius * multiplier;
        const t = this.game.add.tween(this.player.scale).to( { x: newScale, y: newScale }, duration, ease, true);
        if (onCompleteCallback) {
            t.onComplete.add(onCompleteCallback);
        }
        this.game.add.tween(this.player.body.data.shapes[0]).to( { radius: newBodyRadius }, duration, ease, true);
        this.game.add.tween(this).to( { radius: newRadius }, duration, ease, true);
        return newRadius;
    }

    update() {

        // Check if energy is less than 0
        if (this.resources.energy < 0) {
            console.log('game over');
        }

        // Brake
        let speedMultiplier = 1.0;
        if (this.wasdKeys.brake.isDown) {
            this.player.body.damping = 0.95;
            speedMultiplier = 0.5;
        }
        else {
            this.player.body.damping = this.damping;
        }
        
        // Movement controls
        if (this.wasdKeys.left.isDown && !this.wasdKeys.right.isDown) {
            this.player.body.moveLeft(this.speed * speedMultiplier);
        }
        if (this.wasdKeys.right.isDown && !this.wasdKeys.left.isDown) {
            this.player.body.moveRight(this.speed * speedMultiplier);
        }
        if (this.wasdKeys.up.isDown && !this.wasdKeys.down.isDown) {
            this.player.body.moveUp(this.speed * speedMultiplier);
        }
        if (this.wasdKeys.down.isDown && !this.wasdKeys.up.isDown) {
            this.player.body.moveDown(this.speed * speedMultiplier);
        }
    }
}