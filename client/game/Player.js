class Player extends Phaser.Group {
    
    constructor(gameState, x, y, debug) {
        super(gameState.game);
        this.game = gameState.game;
        this.gameState = gameState;
        this.debug = false;
        this.color = 0x6f0fc4;
        this.outlineColor = 0x1e0435;
        this.startingPoint = {
            x: x,
            y: y
        };
        this.radius = 50;
        this.speed = 100;
        this.damping = 0.5;
        this.energy = 100;
        this.lastEnergyThreshold = this.energy;

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

        // Check for food collision
        this.foodCollisionHandler(body);
    }

    foodCollisionHandler(body) {
        if (!this.gameState.food[body.data.id]) {
            return false;
        }

        let food = this.gameState.food[body.data.id];
        if (food.radius < this.radius) {
            this.energy += food.energy;
    
            // Destroy food
            delete this.gameState.food[food.id];
            food.destroy();
            food = null;

            console.log('energy: ' + this.energy);
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
        if (this.energy >= this.lastEnergyThreshold * 2) {
            this.changeSize(1.25);
            this.lastEnergyThreshold *= 2;
        }
        else if (this.energy < this.lastEnergyThreshold / 2) {
            this.changeSize(0.8);
            this.lastEnergyThreshold /= 2;
        }

        // Check if energy is close to 0
        if (this.energy < 1) {
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