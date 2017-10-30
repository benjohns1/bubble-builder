class StaticFloater_Green extends StaticFloater {
    
    constructor(game) {
        super(game, 0x0fc487, 5, 10);
        this.debug = false;
        this.resource.energy = this.radius;
        this.resource.green = Math.ceil(this.radius / 4);
    }
}