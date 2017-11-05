class BuildIcon extends Prefab {

    constructor(gameState, name, x, y, properties) {
        super(gameState, name, x, y, properties);

        // Get structure properties
        this.buildStructureData = this.gameState.assetData.structures[this.properties.structureName];
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

        this.dragIcon.events.onDragStart.add(this.dragStart, this);
        this.dragIcon.events.onDragUpdate.add(this.dragUpdate, this);
        this.dragIcon.events.onDragStop.add(this.dragStop, this);

        this.placementOffset = {
            x: this.game.math.linear(0, -this.dragIcon.width, this.anchor.x),
            y: this.game.math.linear(0, -this.dragIcon.height, this.anchor.y)
        }

        this.cameraDragStart = {};
    }

    dragStart() {
        // Show static icon, while main icon is being dragged
        this.staticIcon.visible = true;
        
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
    }
}