export default class UI_SaveMenu extends Prefab {
    
        constructor(gameState, name, x, y, properties, id) {
            super(gameState, name, x, y, properties, id);
    
            // Set property defaults
            this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };
    
            let currentY = 0;
    
            // Title
            this.title = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.title, this.properties.titleStyle);
            this.addChild(this.title);
            currentY += this.title.height + this.elementPadding.y;

            // Subtitle
            this.subtitle = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.subtitle, this.properties.subTitleStyle);
            this.addChild(this.subtitle);
            currentY += this.subtitle.height + this.elementPadding.y;

            // Create save button for each existing save
            let saveKeys = this.gameState.getSaveGameKeys();
            saveKeys.reverse();
            if (saveKeys) {
                for (let idx in saveKeys) {
                    let save = saveKeys[idx];
                    if (!save) {
                        continue;
                    }
                    let btnSave = this.gameState.uiFactory.textButton.create(save.title, () => {
                        this.gameState.saveGame(save.key);
                        this.gameState.subMenu.close();
                    }, this, 0, currentY);
                    this.addChild(btnSave);
                    currentY += btnSave.height + this.elementPadding.y;
                }

                // @TODO: scrollbars
            }

            // Spacer
            currentY += 20;
            
            // New save button
            const newSaveTitle = "Save Game " + saveKeys.length;
            const btnNewSave = this.gameState.uiFactory.textButton.create("New Save", () => {
                if (this.gameState.saveGame(undefined, newSaveTitle)) {
                    this.gameState.subMenu.close();
                }
            }, this, 0, currentY);
            currentY += btnNewSave.height + this.elementPadding.y;
            this.addChild(btnNewSave);
            
            // @TODO: Save to file
            /*
            let btnRandomRespawn = this.gameState.uiFactory.textButton.create(this.properties.randomLabel, () => {
                this.gameState.respawn();
                this.gameState.subMenu.close();
            }, this, 0, currentY);
            this.addChild(btnRandomRespawn);
            currentY += btnRandomRespawn.height + this.elementPadding.y;*/
        
            // Delete save button
            this.btnDeleteSave = this.gameState.uiFactory.textButton.create(this.properties.saveDeleteLabel, this.saveDelete, this, 0, currentY);
            this.addChild(this.btnDeleteSave);
            currentY += this.btnDeleteSave.height + this.elementPadding.y;

            // Resume button
            this.btnResume = this.gameState.uiFactory.textButton.create(this.properties.resumeLabel, this.gameState.subMenu.close, this.gameState.subMenu, 0, currentY);
            this.addChild(this.btnResume);
            currentY += this.btnResume.height + this.elementPadding.y;
            
            // Get height of all elements
            this.realHeight = currentY - this.elementPadding.y;
    
            // Center all controls
            const centerX = this.getWidth() / 2;
            this.children.forEach(child => {
                child.x = centerX - (child.width / 2);
            });
        }
    
        getHeight() {
            return this.realHeight;
        }

        saveDelete() {
            this.openSubMenu(this.properties.saveDeleteMenu);
            this.close();
        }

        close() {
            this.gameState.gameMenu.visible = false;
        }

        openSubMenu(displayData) {
            this.gameState.subMenu.open(displayData);
            this.gameState.subMenu.center();
        }
    }