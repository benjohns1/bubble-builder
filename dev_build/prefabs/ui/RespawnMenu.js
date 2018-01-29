class UI_RespawnMenu extends Prefab {
    
        constructor(gameState, name, x, y, properties, id) {
            super(gameState, name, x, y, properties, id);
    
            // Set property defaults
            this.elementPadding = this.properties.elementPadding || { "x": 0, "y": 0 };
    
            let currentY = 0;
    
            // Title
            this.title = new Phaser.Text(this.gameState.game, 0, currentY, this.properties.title, this.properties.titleStyle);
            this.addChild(this.title);
            currentY += this.title.height + this.properties.elementPadding.y;

            // Create respawn button for each player base
            if (this.gameState.structures.bases) {
                for (let id in this.gameState.structures.bases) {
                    let base = this.gameState.structures.bases[id];
                    let btnRespawn = this.gameState.uiFactory.textButton.create(base.displayTitle, () => {
                        this.gameState.respawn(id);
                        this.gameState.subMenu.close();
                    }, this, 0, currentY);
                    this.addChild(btnRespawn);
                    currentY += btnRespawn.height + this.properties.elementPadding.y;
                }
                
                // @TODO: scrollbars or "more" button for large number of elements
            }
            
            // Random location
            let btnRandomRespawn = this.gameState.uiFactory.textButton.create(this.properties.randomLabel, () => {
                this.gameState.respawn();
                this.gameState.subMenu.close();
            }, this, 0, currentY);
            this.addChild(btnRandomRespawn);
            currentY += btnRandomRespawn.height + this.properties.elementPadding.y;

            // Resume button
            this.btnResume = this.gameState.uiFactory.textButton.create(this.properties.resumeLabel, this.gameState.subMenu.close, this.gameState.subMenu, 0, currentY);
            this.addChild(this.btnResume);
            currentY += this.btnResume.height + this.properties.elementPadding.y;
            
            // Get height of all elements
            this.realHeight = currentY - this.properties.elementPadding.y;
    
            // Center all controls
            const centerX = this.getWidth() / 2;
            this.children.forEach(child => {
                child.x = centerX - (child.width / 2);
            });
        }
    
        getHeight() {
            return this.realHeight;
        }
    }