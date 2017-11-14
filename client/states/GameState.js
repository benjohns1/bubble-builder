class GameState extends Phaser.State {
    
    constructor() {
        super();
        this.width = 5000;
        this.height = 5000;
        this.floaters = {};
        this.structures = {};
        this.debug = false;
        this.uiFactory = {};

        this.groups = {};
    }

    init(assetData) {
        this.assetData = assetData;
    }

    create() {
        this.uiFactory.textButton = new UIFactory_TextButton(this.game, { "font": "16px Arial", "fill": "#000000" }, 2, { "top": 5, "right": 5, "bottom": 0, "left": 5 });

        // Get center of screen and setup world bounds
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

        // Spawn resources
        const spawnResources = data => {
            let name = data[0], resource = data[1];
            let count = resource.count || 1;
            for (let i = 0; i < count; i++) {
                this.spawnResource(resource.prefabType, name, resource.properties);
            }
        };
        Object.entries(this.assetData.resources).map(spawnResources);
        
        // Initialize the HUD plugin
        this.hud = this.game.plugins.add(HUD, this, this.assetData.hud);

        // Camera
        this.game.camera.follow(this.player.player);

        // Initialize popup window handler
        this.popupWindow = this.prefabFactory("UI_Popup", "popup", 0, 0, this.assetData.ui.popup);
    }

    spawnResource(prefabType, name, properties) {
        let x = this.game.math.between(0, this.game.world.width);
        let y = this.game.math.between(0, this.game.world.height);
        let prefab = this.prefabFactory(prefabType, name, x, y, properties);
        if (prefabType === "Floater") {
            this.floaters[prefab.id] = prefab;
        }
        return prefab;
    }

    spawnStructure(prefabType, name, x, y, properties) {
        let prefab = this.prefabFactory(prefabType, name, x, y, properties);
        this.structures[prefab.id] = prefab;
        return prefab;
    }

    prefabFactory(prefabType, name, x, y, properties) {
        const prefabs = {
            Floater,
            BuildIcon,
            Structure_Base,
            UI_Popup,
            UI_TextListener,
            UI_ResourceTrader
        };
        if (!prefabs.hasOwnProperty(prefabType)) {
            throw new Exception("No prefab found with type: " + prefabType);
        }
        return new prefabs[prefabType](this, name, x, y, properties);
    }

    removeFloater(floaterId) {
        let floater = this.floaters[floaterId];
        this.spawnResource(floater.constructor.name, floater.name, this.assetData.resources[floater.name].properties);
        delete this.floaters[floaterId];
    }
}