class BuildIcon extends Prefab {

    constructor(gameState, name, x, y, properties, id) {
        super(gameState, name, x, y, properties, id);

        // Get structure properties
        this.buildStructureData = this.gameState.assetData.structures[this.properties.structureName];
        super.loadDisplayData();
        const buildProps = this.buildStructureData.properties;

        // Set property defaults
        this.debug = this.properties.debug || false;
        this.color = Phaser.Color.hexToRGB(buildProps.color || "#ffffff");

        // Create building icon graphics
        this.dragIcon = Structure.createGraphics(this.game, this.anchor, buildProps.width, buildProps.height, this.color, 1.0);
        this.staticIcon = Structure.createGraphics(this.game, this.anchor, buildProps.width, buildProps.height, this.color, 0.5);
        this.staticIcon.visible = false;
        this.addChild(this.dragIcon);
        this.addChild(this.staticIcon);

        this.dragIcon.inputEnabled = true;
        this.dragIcon.input.enableDrag();

        this.prevCursor = "inherit";
        this.dragIcon.events.onInputOver.add((displayObject, pointer) => {
            this.prevCursor = this.game.canvas.style.cursor;
            this.game.canvas.style.cursor = "move";
            this.showBuildData(displayObject, pointer);
        }, this);
        this.dragIcon.events.onInputOut.add(() => {
            this.game.canvas.style.cursor = this.prevCursor;
            this.gameState.hoverWindow.close();
        }, this);

        this.dragIcon.events.onDragStart.add(this.dragStart, this);
        this.dragIcon.events.onDragUpdate.add(this.dragUpdate, this);
        this.dragIcon.events.onDragStop.add(this.dragStop, this);

        this.placementOffset = {
            x: this.game.math.linear(0, -this.dragIcon.width, this.anchor.x),
            y: this.game.math.linear(0, -this.dragIcon.height, this.anchor.y)
        }

        this.cameraDragStart = {};
    }
    
    showBuildData(displayObject, pointer) {
        const findDisplayData = function(obj) {
            if (obj.displayData) {
                return obj.displayData;
            }
            if (!obj.parent) {
                return null;
            }
            return findDisplayData(obj.parent); // recursively look higher up chain
        }
        this.gameState.hoverWindow.open(findDisplayData(displayObject));
        this.gameState.hoverWindow.x = this.x - this.getWidth() - this.gameState.hoverWindow.getWidth() - 10 - this.game.camera.x;
        this.gameState.hoverWindow.y = this.y - this.gameState.hoverWindow.getHeight() + this.getHeight() - this.game.camera.y;
        this.gameState.hoverWindow.fixedToCamera = true;
    }

    dragStart() {
        // Show static icon, while main icon is being dragged
        this.staticIcon.visible = true;

        this.gameState.hoverWindow.close();
        
        this.cameraDragStart = {
            x: this.game.camera.x,
            y: this.game.camera.y
        }
    }

    dragUpdate(icon, pointer) {
        // Adjust for a moving camera
        this.dragIcon.x += this.cameraDragStart.x - this.game.camera.x;
        this.dragIcon.y += this.cameraDragStart.y - this.game.camera.y;
    }

    dragStop() {

        // Adjust build locaton based on icon anchor offset and camera position
        const x = this.placementOffset.x + this.dragIcon.worldPosition.x + this.game.camera.x;
        const y = this.placementOffset.y + this.dragIcon.worldPosition.y + this.game.camera.y;

        // Try to build structure
        this.gameState.player.buildStructure(this.properties.structureName, x, y);

        // Move drag icon back to toolbar, hide static icon
        this.staticIcon.visible = false;
        this.dragIcon.position.copyFrom(this.staticIcon.position);

        // Change cursor
        this.game.canvas.style.cursor = "pointer";
    }
}