class GameState extends Phaser.State {
    
    constructor() {
        super();
        this.width = 5000;
        this.height = 5000;
        this.floaters = {};
        this.structures = {};
        this.bases = {};
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

        // Setup world bounds
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

        // Spawn resources
        const spawnResources = data => {
            let name = data[0], resource = data[1];
            let count = resource.count || 1;
            for (let i = 0; i < count; i++) {
                this.spawnResource(resource.prefabType, name, resource.properties);
            }
        };
        Object.entries(this.assetData.resources).map(spawnResources);
        
        // Player
        this.respawn();
        
        // Initialize the HUD plugin
        this.hud = this.game.plugins.add(HUD, this, this.assetData.hud);

        // Initialize hover-over window handler
        this.hoverWindow = this.prefabFactory("UI_Popup", "hoverWindow", 0, 0, this.assetData.ui.hover);

        // Pop-up window handler
        this.popupWindow = this.prefabFactory("UI_Popup", "popupWindow", 0, 0, this.assetData.ui.popup);

        // Game menu
        this.gameMenu = this.prefabFactory("UI_Popup", "gameMenu", 0, 0, this.assetData.ui.menu);
        // Preload (but hide) static game menu data
        this.gameMenu.open(this.assetData.ui.menu.displayData);
        this.gameMenu.visible = false;
        
        // Dynamic submenu
        this.subMenu = this.prefabFactory("UI_Popup", "gameSubmenu", 0, 0, this.assetData.ui.menu);
    }

    saveGame() {
        console.log('save');
    }
    
    loadGame() {
        console.log('load');
    }
    
    respawn(loc = undefined) {

        const playerRadius = 10;
        if (!loc) {
            // No location specified, use random one
            loc = this.getRandomWorldLocation(playerRadius);
        }
        else {
            // If valid prefab ID specified, find coordinates
            this.bases.hasOwnProperty(loc);
            loc = new Phaser.Point(this.bases[loc].x - playerRadius - this.bases[loc].getWidth(), this.bases[loc].y + (this.bases[loc].getHeight() / 2));
        }

        if (!this.player) {
            // Spawn new player
            this.player = new Player(this, loc.x, loc.y);
        }
        else {
            // Respawn existing player
            this.player.respawn(loc.x, loc.y);
        }

        // Camera
        this.game.camera.follow(this.player);
    }

    getRandomWorldLocation(border = 0) {
        const x = this.game.rnd.integerInRange(0 + border, this.game.world.width - border);
        const y = this.game.rnd.integerInRange(0 + border, this.game.world.height - border);
        return new Phaser.Point(x, y);
    }
    
    toggleGameMenu() {
        this.gameMenu.visible = !this.gameMenu.visible;
        if (this.gameMenu.visible) {
            this.gameMenu.bringToTop();
            this.gameMenu.center();
        }
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
        if (prefabType === "Structure_Base") {
            this.bases[prefab.id] = prefab;
        }
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
            UI_GameMenu,
            UI_RespawnMenu
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