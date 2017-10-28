class GameState extends Phaser.State {
    
    constructor() {
        super();
        this.width = 5000;
        this.height = 5000;
        this.floaterCounts = {
            green: 150,
            red: 50,
            purple: 20
        };
        this.floaters = {};
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

        // Create floating resources
        this.createFloaters();

        // Camera
        this.game.camera.follow(this.player.player);
    }

    createFloaters() {
        for (let i = 0; i < this.floaterCounts.green; i++) {
            let floater = new StaticFloater_Green(this.game);
            this.floaters[floater.id] = floater;
        }
        for (let i = 0; i < this.floaterCounts.red; i++) {
            let floater = new StaticFloater_Red(this.game);
            this.floaters[floater.id] = floater;
        }
        for (let i = 0; i < this.floaterCounts.purple; i++) {
            let floater = new StaticFloater_Purple(this.game);
            this.floaters[floater.id] = floater;
        }
    }

    floaterFactory(className) {
        const classes = {
            StaticFloater_Green,
            StaticFloater_Red,
            StaticFloater_Purple
        }
        return new classes[className](this.game);
    }

    removeFloater(floaterId) {
        let className = this.floaters[floaterId].constructor.name;
        delete this.floaters[floaterId];
        let newFloater = this.floaterFactory(className);
        this.floaters[newFloater.id] = newFloater;
    }
}