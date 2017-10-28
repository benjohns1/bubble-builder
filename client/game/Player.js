class Player extends Phaser.Group {
    
    constructor(gameState, x, y, debug) {
        super(gameState.game);
        this.gameState = gameState;
        this.debug = false;
        this.color = 0x3916a0;
        this.outlineColor = 0x51efe7;
        this.startingPoint = {
            x: x,
            y: y
        };
        this.radius = 50;
        this.speed = 100;
        this.damping = 0.5;
        this.resource = {
            energy: this.radius,
            green: 0,
            red: 0,
            purple: 0
        };
        this.lastEnergyThreshold = this.resource.energy;

        // Input bindings
        this.wasdKeys = this.game.input.keyboard.addKeys({
            up: Phaser.KeyCode.W,
            down: Phaser.KeyCode.S,
            left: Phaser.KeyCode.A,
            right: Phaser.KeyCode.D
        });

        this.game.input.onDown.add(this.handlePointerInput, this);
        
        // Player
        this.player = this.createPlayerGraphics(this.startingPoint.x, this.startingPoint.y, this.radius);

        // Eat food
        this.player.body.onBeginContact.add(this.collisionHandler, this);
    }

    collisionHandler(body) {

        if (!body || !body.data || !body.data.id) {
            return;
        }

        // Check for floater collision
        this.floaterCollisionHandler(body);
    }

    addResource(fromEntity, type) {
        
        if (!fromEntity.resource[type]) {
            return false;
        }
        this.resource[type] += fromEntity.resource[type];
        return true;
    }

    floaterCollisionHandler(body) {
        if (!this.gameState.floaters[body.data.id]) {
            return false;
        }

        let floater = this.gameState.floaters[body.data.id];
        if (floater.radius < this.radius) {
            this.addResource(floater, 'energy');
            this.addResource(floater, 'green');
            this.addResource(floater, 'red');
            this.addResource(floater, 'purple');
    
            // Destroy floater
            this.gameState.removeFloater(floater.id);
            floater.destroy();
            floater = null;

            console.log('player resources: ', this.resource);
        }
    }

    createPlayerGraphics(x, y, radius) {

        // Draw player
        const player = this.game.add.graphics(x, y);
        player.lineStyle(2, this.outlineColor, 0.7);
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
        const newBodyRadius = this.player.body.data.shapes[0].radius *multiplier;
        const newRadius = this.radius * multiplier;
        const t = this.game.add.tween(this.player.scale).to( { x: newScale, y: newScale }, duration, ease, true);
        if (onCompleteCallback) {
            t.onComplete.add(onCompleteCallback);
        }
        this.game.add.tween(this.player.body.data.shapes[0]).to( { radius: newBodyRadius }, duration, ease, true);
        this.game.add.tween(this).to( { radius: newRadius }, duration, ease, true);
    }

    update() {
        // Check if grow/shrink threshold has been crossed
        if (this.resource.energy >= this.lastEnergyThreshold * 2) {
            this.changeSize(1.25);
            this.lastEnergyThreshold *= 2;
        }
        else if (this.resource.energy < this.lastEnergyThreshold / 2) {
            this.changeSize(0.8);
            this.lastEnergyThreshold /= 2;
        }

        // Check if energy is close to 0
        if (this.resource.energy < 1) {
            console.log('game over');
        }
        
        // Handle keyboard inputs
        if (this.wasdKeys.left.isDown) {
            this.player.body.moveLeft(this.speed);
        }
        if (this.wasdKeys.right.isDown) {
            this.player.body.moveRight(this.speed);
        }
        if (this.wasdKeys.up.isDown) {
            this.player.body.moveUp(this.speed);
        }
        if (this.wasdKeys.down.isDown) {
            this.player.body.moveDown(this.speed);
        }
    }

    handlePointerInput(pointer) {

        console.log('pointer', pointer);
    }
}