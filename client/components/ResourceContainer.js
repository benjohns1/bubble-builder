class Component_ResourceContainer extends Component {
    
    constructor(parent, initialResources) {
        super(parent);
        
        // Deep-copy initial resources to this instance
        const resources = {};
        Phaser.Utils.extend(true, resources, initialResources);

        // Create public getter for each resource
        Object.keys(resources).map(resourceName => {
            Object.defineProperty(this, resourceName, { get: function() {
                return resources[resourceName];
            }});
        }, this);
        
        // Public getter to get list of resources
        Object.defineProperty(this, "list", {
            get: function() {
                // Return copy of object list, so it can't be directly modified
                const resourceList = {};
                Phaser.Utils.extend(true, resourceList, resources);
                return resourceList;
            }
        });

        this.add = function(resourceName, amount) {
            if (resources[resourceName] === undefined) {
                resources[resourceName] = 0;
            }
            resources[resourceName] += amount;
        };

        this.remove = function(resourceName, amount) {
            resources[resourceName] -= amount;
        }
    }

    takeFrom(target, resourceName, amount = Infinity) {

        if (!(target instanceof Component_ResourceContainer)) {
            throw new Exception("Target must be an instance of Component_ResourceContainer");
        }
        if (!target[resourceName]) {
            return false;
        }
        const amountToTake = Math.min(target[resourceName], amount);
        this.add(resourceName, amountToTake);
        target.remove(resourceName, amountToTake);
        return true;
    }
    
}