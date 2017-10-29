class HUD extends Phaser.Plugin {

    init(gameState, data) {
        this.gameState = gameState;
        this.prefabs = [];
        this.data = data;
        this.margins = data.margins || { "top": 0, "left": 0, "right": 0, "bottom": 0 };

        this.setup();
    }

    setup() {
        // Destroy any existing HUD elements
        this.prefabs.forEach((prefab) => {
            prefab.destroy();
        });

        let cameraWidth = this.cameraWidth = this.gameState.game.camera.width;
        let cameraHeight = this.cameraHeight = this.gameState.game.camera.height;
        let cameraCenter = new Phaser.Point(cameraWidth / 2, cameraHeight / 2);

        // Setup HUD screen regions 9x9 grid
        this.regions = {
            topLeft: {
                begin: {x: this.margins.left, y: this.margins.top},
                end: {x: (cameraWidth / 3) - this.margins.right, y: this.margins.top},
                valign: "top",
                align: "left",
                defaultAnchor: {x: 0, y: 0},
            },
            topCenter: {
                begin: {x: (cameraWidth / 3) + this.margins.left, y: this.margins.top},
                end: {x: (2 * cameraWidth / 3) - this.margins.right, y: this.margins.top},
                valign: "top",
                align: "center",
                defaultAnchor: {x: 0.5, y: 0},
            },
            topRight: {
                begin: {x: (2 * cameraWidth / 3) + this.margins.left, y: this.margins.top},
                end: {x: cameraWidth - this.margins.right, y: this.margins.top},
                valign: "top",
                align: "right",
                defaultAnchor: {x: 1.0, y: 0},
            },
            centerLeft: {
                begin: {x: this.margins.left, y: (cameraHeight / 3) + this.margins.top},
                end: {x: this.margins.left, y: (2 * cameraHeight / 3) - this.margins.bottom},
                valign: "center",
                align: "left",
                defaultAnchor: {x: 0, y: 0},
            },
            center: {
                begin: {x: (cameraWidth / 3) + this.margins.left, y: cameraCenter.y},
                end: {x: (2 * cameraWidth / 3) - this.margins.right, y: cameraCenter.y},
                valign: "center",
                align: "center",
                defaultAnchor: {x: 0.5, y: 0},
            },
            centerRight: {
                begin: {x: cameraWidth - this.margins.right, y: (cameraHeight / 3) + this.margins.top},
                end: {x: cameraWidth - this.margins.right, y: (2 * cameraHeight / 3) + this.margins.top},
                valign: "center",
                align: "right",
                defaultAnchor: {x: 1.0, y: 0},
            },
            bottomLeft: {
                begin: {x: this.margins.left, y: cameraHeight - this.margins.bottom},
                end: {x: (cameraWidth / 3) - this.margins.right, y: cameraHeight - this.margins.bottom},
                valign: "bottom",
                align: "left",
                defaultAnchor: {x: 0, y: 0},
            },
            bottomCenter: {
                begin: {x: (cameraWidth / 3) + this.margins.left, y: cameraHeight - this.margins.bottom},
                end: {x: (2 * cameraWidth / 3) - this.margins.right, y: cameraHeight - this.margins.bottom},
                valign: "bottom",
                align: "center",
                defaultAnchor: {x: 0.5, y: 0},
            },
            bottomRight: {
                begin: {x: (2 * cameraWidth / 3) + this.margins.left, y: cameraHeight - this.margins.bottom},
                end: {x: cameraWidth - this.margins.right, y: cameraHeight - this.margins.bottom},
                valign: "bottom",
                align: "right",
                defaultAnchor: {x: 1.0, y: 0},
            }
        };

        this.populatedRegions = {};
        
        // Create HUD elements
        for (let [region, regionElements] of Object.entries(this.data.elements)) {
            if (!this.regions[region]) {
                throw new Exception("Invalid region: " + region);
            }
            this.populatedRegions[region] = {
                contentHeight: 0,
                contentWidth: 0,
                prefabs: []
            };
            for (let [prefabName, element] of Object.entries(regionElements)) {
                if (element.properties.anchor === undefined) {
                    element.properties.anchor = this.regions[region].defaultAnchor;
                }
                let prefab = this.gameState.prefabFactory(element.prefabType, prefabName, 0, 0, element.properties);
                this.populatedRegions[region].prefabs.push(prefab);
                this.populatedRegions[region].contentHeight += prefab.getMaxChildProperty('height');
                this.populatedRegions[region].contentWidth += prefab.getMaxChildProperty('width');
                this.prefabs.push(prefab);
            }
        }

        // Adjust HUD element layout after all prefabs are instantiated & known
        let x;
        let y;
        for (let [regionName, regionData] of Object.entries(this.populatedRegions)) {
            let region = this.regions[regionName];
            let prefabs = regionData.prefabs;
            switch (region.align) {
                default:
                case "left":
                    x = region.begin.x;
                    break;
                case "center":
                    x = (region.begin.x + region.end.x) / 2;
                    break;
                case "right":
                    x = region.end.x;
                    break;
            }
            switch (region.valign) {
                default:
                case "top":
                    y = region.begin.y;
                    break;
                case "center":
                    y = ((region.begin.y + region.end.y) / 2) - (regionData.contentHeight / 2);
                    break;
                case "bottom":
                    y = region.begin.y - regionData.contentHeight;
                    break;
            }
            prefabs.forEach((prefab) => {
                prefab.x = x;
                prefab.y = y;
                prefab.fixedToCamera = true;
                y += prefab.getMaxChildProperty('height');
            });
        }
    }

    render() {
        if ((this.cameraHeight !== this.gameState.game.camera.height)
            || (this.cameraWidth !== this.gameState.game.camera.width)) {
            this.setup();
        }
    }
}