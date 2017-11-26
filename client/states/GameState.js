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
        this.uiFactory.textButton = new UI_Factory_TextButton(this.game, { "font": "16px Arial", "fill": "#000000" }, 2, { "top": 6, "right": 10, "bottom": 1, "left": 10 });
        this.uiFactory.textDropdown = new UI_Factory_TextDropdown(this.game, { "font": "16px Arial", "fill": "#000000" }, 2, { "top": 6, "right": 10, "bottom": 1, "left": 10 });

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

        // Initialize hover-over window handler
        this.hoverWindow = this.prefabFactory("UI_Popup", "hoverWindow", 0, 0, this.assetData.ui.hover);
        this.popupWindow = this.prefabFactory("UI_Popup", "popupWindow", 0, 0, this.assetData.ui.popup);
        this.gameMenu = this.prefabFactory("UI_Popup", "gameMenu", 0, 0, this.assetData.ui.menu);
    }
    
    toggleGameMenu() {
        this.gameMenu.visible = !this.gameMenu.visible;
        this.gameMenu.center();
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
            UI_ResourceTrader,
            UI_GameMenu
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