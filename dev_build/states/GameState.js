class GameState extends Phaser.State {
    
    constructor() {
        super();
        this.freeBuild = false;
        this.width = 10000;
        this.height = 10000;
        this.grid = [];
        this.floaters = {};
        this.structures = {
            "bases": {}
        };
        this.debug = false;
        this.uiFactory = {};
        this.autosaveTimer = 180000; // every 3 minutes
        this.nextAutosaveTime = 0;

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
            },
            clearAll: () => {
                this.keys = {};
            }
        };

        // Notifications
        const self = this;
        this.notify = {
            error: function(text) {
                if (self.notifier) {
                    self.notifier.notify(text, 0xff0000, 0xffaaaa);
                }
                else {
                    console.error("Error: " + text);
                }
            },
            warn: function(text) {
                if (self.notifier) {
                    self.notifier.notify(text, 0xff5733, 0xffddaa);
                }
                else {
                    console.warn("Warn: " + text);
                }
            },
            info: function(text) {
                if (self.notifier) {
                    self.notifier.notify(text, 0x0bad52, 0x8ef4bb);
                }
                else {
                    console.log("Info: " + text);
                }
            },
            death: function(text) {
                if (self.notifier) {
                    self.notifier.notify(text, 0x000000);
                }
                else {
                    console.log(text);
                }
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
        
        // Generate game grid
        this.tileSize = 100;
        this.grid = this.generateGrid();

        // Generate barriers & walls within grid
        this.generateBarriers();

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
        
        // UI Notifications
        this.notifier = this.prefabFactory("UI_Notifier", "notifier", 0, 0, this.assetData.ui.notifier);

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

        this.nextAutosaveTime = this.game.time.now + this.autosaveTimer;

        // If last savegame exists, load it
        if (!localStorage.getItem('newGameOnLoad')) {
            try {
                if (!this.loadGame()) {
                    this.notify.info("Starting new game");
                }
            }
            catch (err) {
                this.notify.error("Could not load previously saved game: " + err.message);
            }
        }
    }

    generateGrid(defaultTileState = {}) {
        let height = this.game.world._height;
        let width = this.game.world._width;
        let grid = [];
        for (let x = 0; x < Math.ceil(width / this.tileSize); x++) {
            grid[x] = [];
            for (let y = 0; y < Math.ceil(height / this.tileSize); y++) {
                grid[x][y] = {};
                Phaser.Utils.extend(true, grid[x][y], defaultTileState);
            }
        }
        return grid;
    }

    getTileFromCoord(xCoord, yCoord) {
        let height = this.game.world._height;
        let width = this.game.world._width;
        if (xCoord < 0 || xCoord > width || yCoord < 0 || yCoord > height) {
            return null;
        }

        let x = Math.ceil(xCoord / this.tileSize);
        let y = Math.ceil(yCoord / this.tileSize);
        return {
            "x": x,
            "y": y,
            "state": grid[x][y]
        }
    }

    generateBarriers() {
        let lastCol = this.grid.length - 1;
        let points = this.grid.reduce((acc, col, x) => {
            let lastRow = col.length -1;
            return acc.concat(col.reduce((acc, tile, y) => {
                if (x !== 0 && x !== lastCol && y !== 0 && y !== lastRow) {
                    // Create walls on grid edge tiles
                    return acc;
                }
                tile.barrier = true; // change tile grid state to "barrier"
                acc.push({
                    "x": x,
                    "y": y,
                    "tile": tile
                });
                return acc;
            }, []));
        }, []);
        let g = new Phaser.Graphics(this.game, 0, 0);
        g.beginFill(0x000000);
    }

    update() {
        // Autosave
        if (this.nextAutosaveTime > this.game.time.now) {
            return;
        }
        this.saveGame('autosave', "Autosave", "Game autosaved");
        this.nextAutosaveTime += this.autosaveTimer;
    }

    getSaveGameKeys() {
        const keyData = localStorage.getItem('saveGameKeys');
        if (!keyData) {
            return {};
        }
        const keys = JSON.parse(keyData);
        if (!keys) {
            this.notify.error("Error loading save game keys");
            return {};
        }
        return keys;
    }

    setSaveGameKey(key, title = undefined) {
        let keyData = this.getSaveGameKeys();
        const newSaveMeta = {
            key: key,
            title: title,
            time: Date.now()
        };
        if (key && keyData[key]) {
            Phaser.Utils.extend(true, keyData[key], newSaveMeta);
        }
        else {
            if (key === undefined || key === null) {
                key = keyData ? Object.keys(keyData).length : 0;
            }
            newSaveMeta.key = key;
            keyData[key] = newSaveMeta;
        }
        localStorage.setItem('saveGameKeys', JSON.stringify(keyData));
        return key;
    }

    deleteSave(key) {
        if (key === undefined || key === null) {
            return;
        }
        let keyData = this.getSaveGameKeys();
        if (keyData[key]) {
            delete keyData[key];
            localStorage.setItem('saveGameKeys', JSON.stringify(keyData));
        }
        localStorage.removeItem('save.' + key);
    }

    saveGame(key, title = undefined, successMessage = "Game saved") {
        const save = {
            "player": this.player.getState(),
            "grid": this.grid,
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
            // Save game
            if (title === undefined) {
                const now = new Date();
                title = now.getFullYear() + '-' + (now.getMonth()+1).toString().padStart(2, "00") + '-' + now.getDate().toString().padStart(2, "00") + ' ' + now.getHours() + ':' + now.getMinutes().toString().padStart(2, "00") + ':' + now.getSeconds().toString().padStart(2, "00");
            }

            key = this.setSaveGameKey(key, title);
            localStorage.setItem('save.' + key, JSON.stringify(save));
            localStorage.removeItem('newGameOnLoad');
        }
        catch (err) {
            this.notify.error("Error saving game to local storage: " + err.message);
            return false;
        }

        if (successMessage) {
            this.notify.info(successMessage);
        }
        return true;
    }

    getLatestSaveKey() {
        const saveKeys = this.getSaveGameKeys();
        let latest = undefined;
        for (let i in saveKeys) {
            if (!saveKeys[i]) {
                continue;
            }
            if (!latest || latest.time < saveKeys[i].time) {
                latest = saveKeys[i]
            }
        }
        return latest ? latest.key : undefined;
    }
    
    loadGame(key) {
        if (key === undefined || key === null) {
            // If no key specified, load the last one
            key = this.getLatestSaveKey();
        }
        
        const loadData = localStorage.getItem('save.' + key);
        if (!loadData) {
            return false;
        }
        const load = JSON.parse(loadData);
        if (!load) {
            this.notify.error("Error loading game data");
            return false;
        }

        // Load map grid
        Phaser.Utils.extend(true, this.grid, load.grid);

        // Clear existing floaters
        for (let i in this.floaters) {
            this.floaters[i].destroy();
        }
        // Clear existing structures
        for (let i in this.structures) {
            for (let j in this.structures[i]) {
                this.structures[i][j].destroy();
            }
        }
        // Clear currently loaded player
        let playerId = undefined;
        if (this.player) {
            playerId = this.player.id;
            this.player.destroy();
        }
        // Clear any remaining keys
        this.keyGen.clearAll();

        // Load floaters
        this.floaters = {};
        for (let i in load.floaters) {
            let floater = Prefab.loadFromState(this, load.floaters[i], i);
            this.floaters[floater.id] = floater;
        }

        // Load structures
        this.structures = {};
        for (let i in load.structures) {
            this.structures[i] = {};
            for (let j in load.structures[i]) {
                let structure = Prefab.loadFromState(this, load.structures[i][j], j);
                this.structures[i][structure.id] = structure;
            }
        }

        // Load player
        this.player = Prefab.loadFromState(this, load.player, playerId);
        this.game.camera.follow(this.player);

        // Reset HUD and UI
        this.hoverWindow.close();
        this.popupWindow.close();
        this.gameMenu.visible = false;
        this.subMenu.close();
        this.hud.setup();
        
        this.notify.info("Game loaded");
        return true;
    }

    restart() {
        localStorage.setItem('newGameOnLoad', true);
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
            Structure_Silo,
            UI_Notifier,
            UI_Popup,
            UI_TextListener,
            UI_ResourceTrader,
            UI_StructureManager,
            UI_GameMenu,
            UI_RespawnMenu,
            UI_SaveMenu,
            UI_LoadMenu,
            UI_SaveDeleteMenu,
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

    removePrefab(prefabType, id) {
        // Maintain game references for particular prefab types
        switch (prefabType) {
            case "Floater":
                this.removeFloater(id);
                break;
            case "Structure_Base":
                let structure = this.structures.bases[id];
                delete this.structures.bases[id];
                structure.destroy();
                break;
        }
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