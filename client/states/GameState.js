class GameState extends Phaser.State {
    
    constructor() {
        super();
        this.width = 5000;
        this.height = 5000;
        this.foodCount = 200;
        this.food = [];
        this.debug = false;
    }

    create() {
        const center = { x: this.game.width / 2, y: this.game.height / 2 };
        this.game.world.setBounds(0, 0, this.width, this.height);

        // Add background gradient
        this.game.stage.backgroundColor = "#ffffff";
        const myBitmap = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
        let grd = myBitmap.context.createLinearGradient(0, 0, 0, this.game.world.height);
        grd.addColorStop(0, "#b9f2f7");
        grd.addColorStop(1, "#0e1723");
        myBitmap.context.fillStyle = grd;
        myBitmap.context.fillRect(0, 0, this.game.world.width, this.game.world.height);
        this.game.add.sprite(0, 0, myBitmap, 'background');

        // Game physics
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // Player
        this.player = new Player(this, center.x, center.y);

        // Create food
        for (let i = 0; i < this.foodCount; i++) {
            let food = new Food(this.game);
            this.food[food.id] = food;
        }

        // Camera
        this.game.camera.follow(this.player.player);
    }
}