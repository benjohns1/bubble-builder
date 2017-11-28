class GameState extends Phaser.State {
    
    constructor() {
        super();
        this.width = 5000;
        this.height = 5000;
        this.floaters = {};
        this.structures = {
            "bases": {}
        };
        this.debug = false;
        this.uiFactory = {};

        // For generating and registering unique keys across game state
        this.keys = {};
        this.keyNonce = 0;
        this.keyGen = {
            get: () => {
                while (this.keys.hasOwnProperty(this.keyNonce)) {
                    this.keyNonce++;
                }
                this.keys[this.keyNonce] = true;
                return this.keyNonce;
            },
            add: key => {
                if (this.keys[key]) {
                    throw new Exception("Key '" + key + "' already in use");
                }
                this.keys[key] = true;
            },
            free: key => {
                delete this.keys[key];
            },
            used: key => {
                return !!this.keys[key];
            }
        };

        // Notifications
        this.notify = {
            // @TODO: usein-game notification dialog
            error: function(text) {
                console.error("Error: " + text);
            },
            warn: function(text) {
                console.warn("Warn: " + text);
            },
            info: function(text) {
                console.log("Info: " + text);
            },
            death: function(text) {
                console.log(text);
            }
        }
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
            let count = resource.count || 0;
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

        // If savegame exists, load it
        try {
            this.loadGame();
        }
        catch (err) {
            this.notify.error("Could not load previously saved game: " + err.message);
        }
    }

    saveGame() {
        const save = {
            "player": this.player.getState(),
            "floaters": {},
            "structures": {}
        };
        for (let i in this.floaters) {
            let floater = this.floaters[i].getState();
            save.floaters[i] = floater;
        }
        for (let i in this.structures) {
            save.structures[i] = {};
            for (let j in this.structures[i]) {
                let structure = this.structures[i][j].getState();
                save.structures[i][j] = structure;
            }
        }

        try {
            localStorage.setItem('save', JSON.stringify(save));
        }
        catch (err) {
            this.notify.error("Error saving game to local storage: " + err.message);
            return false;
        }

        this.notify.info("Game saved");
        return true;
    }
    
    loadGame() {
        const loadData = localStorage.getItem('save');
        if (!loadData) {
            this.notify.info("No game to load", "warn");
            return;
        }
        const load = JSON.parse(loadData);
        if (!load) {
            this.notify.error("Error loading game data");
            return;
        }

        // Clear existing and load floaters
        for (let i in this.floaters) {
            this.floaters[i].destroy();
        }
        this.floaters = {};
        for (let i in load.floaters) {
            let floater = Prefab.loadFromState(this, load.floaters[i], i);
            this.floaters[floater.id] = floater;
        }

        // Clear existing and load structures
        for (let i in this.structures) {
            for (let j in this.structures[i]) {
                this.structures[i][j].destroy();
            }
        }
        this.structures = {};
        for (let i in load.structures) {
            this.structures[i] = {};
            for (let j in load.structures[i]) {
                let structure = Prefab.loadFromState(this, load.structures[i][j], j);
                this.structures[i][structure.id] = structure;
            }
        }

        // Clear existing and load player
        let playerId = undefined;
        if (this.player) {
            playerId = this.player.id;
            this.player.destroy();
        }
        this.player = Prefab.loadFromState(this, load.player, playerId);
        this.game.camera.follow(this.player);

        // Reset HUD and UI
        this.hoverWindow.close();
        this.popupWindow.close();
        this.gameMenu.visible = false;
        this.subMenu.close();
        this.hud.setup();
        
        this.notify.info("Game loaded");
    }

    restart() {
        localStorage.removeItem('save');
        this.state.start('Boot');
    }
    
    respawn(loc = undefined) {

        const playerRadius = 10;
        const bases = this.structures.bases;
        if (!loc) {
            // No location specified, use random one
            loc = this.getRandomWorldLocation(playerRadius);
        }
        else {
            // If valid prefab ID specified, find coordinates
            bases.hasOwnProperty(loc);
            loc = new Phaser.Point(bases[loc].x - playerRadius - bases[loc].getWidth(), bases[loc].y + (bases[loc].getHeight() / 2));
        }

        if (!this.player) {
            // Spawn new player
            this.player = this.prefabFactory(this.assetData.player.init.prefabType, 'player', loc.x, loc.y, this.assetData.player.init.properties);
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

    spawnPlayerCorpse(player) {
        const corpseProperties = {};
        Phaser.Utils.extend(true, corpseProperties, this.assetData.resources.floaterCorpse.properties);
        corpseProperties.resources = player.resources.list;
        corpseProperties.radius = player.radius;
        this.prefabFactory("Floater", "player", player.x + (player.radius * 2), player.y, corpseProperties);
    }

    spawnResource(prefabType, name, properties) {
        let x = this.game.math.between(0, this.game.world.width);
        let y = this.game.math.between(0, this.game.world.height);
        return this.prefabFactory(prefabType, name, x, y, properties);
    }

    prefabFactory(prefabType, name, x, y, properties = {}, id = undefined) {
        const prefabs = {
            Player,
            Floater,
            BuildIcon,
            Structure_Base,
            UI_Popup,
            UI_TextListener,
            UI_ResourceTrader,
            UI_GameMenu,
            UI_RespawnMenu,
            UI_ConfirmDialog
        };
        if (!prefabs.hasOwnProperty(prefabType)) {
            throw new Exception("No prefab found with type: " + prefabType);
        }
        const prefab = new prefabs[prefabType](this, name, x, y, properties, id);

        // Maintain game references for particular prefab types
        switch (prefabType) {
            case "Floater":
                this.floaters[prefab.id] = prefab;
                break;
            case "Structure_Base":
                this.structures.bases[prefab.id] = prefab;
                break;
        }

        return prefab;
    }

    componentFactory(componentType, parent) {
        const components = {
            Component_ResourceContainer
        };
        if (!components.hasOwnProperty(componentType)) {
            throw new Exception("No component found with type: " + componentType);
        }
        const args = Array.prototype.slice.call(arguments).slice(2);
        return new components[componentType](parent, ...args);
    }

    removeFloater(floaterId) {
        let floater = this.floaters[floaterId];
        const floaterData = this.assetData.resources[floater.name];
        if (floaterData) {
            // If this is a valid named resource, respawn it somewhere else on map
            this.spawnResource(floaterData.prefabType, floater.name, floaterData.properties);
        }
        delete this.floaters[floaterId];
        floater.destroy();
    }

    getFloater(physicsBodyId) {
        for (let i in this.floaters) {
            if (this.floaters[i].physicsId === physicsBodyId) {
                return this.floaters[i];
            }
        }
    }
}