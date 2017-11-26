class Component_ResourceContainer extends Component {
    
    constructor(parent, initialResources, limits, restrict = false) {
        super(parent);
        
        // Change event
        this.onChange = new Phaser.Signal();

        // Deep-copy initial resources to this instance (if restricted, only manages resources in initial list)
        let resources = {};
        this.reset = function(newResources, newRestrict = false) {
            resources = newRestrict ? {} : {
                energy: 0,
                green: 0,
                red: 0,
                purple: 0
            };
            Phaser.Utils.extend(true, resources, newResources);
            this.onChange.dispatch();
        }
        this.reset(initialResources, restrict);

        // Deep-copy any resourece limits
        this.limits = {};
        Phaser.Utils.extend(true, this.limits, limits);

        // Create public getter for each resource
        Object.keys(resources).map(resourceName => {
            Object.defineProperty(this, resourceName, {
                get: function() {
                    return resources[resourceName] || 0;
                },
                set: function(amount) {
                    if (this.limits[resourceName]) {
                        // Clamp to resource limits
                        amount = Math.min(Math.max(this.limits[resourceName][0], amount), this.limits[resourceName][1]);
                    }
                    else if (amount < 0) {
                        amount = 0;
                    }
                    const prev = resources[resourceName];
                    resources[resourceName] = amount;
                    if (prev !== resources[resourceName]) {
                        this.onChange.dispatch();
                    }
                }
            });
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

        this.valid = function(resourceName) {
            return resources.hasOwnProperty(resourceName);
        }
    }

    static verifyResourceContainer(obj, name) {
        if (!(obj instanceof Component_ResourceContainer)) {
            name = name ? name + " " : "";
            throw new Exception(name + "must be an instance of Component_ResourceContainer");
        }
    }

    add(resourceName, amount) {
        if (!this.valid(resourceName)) {
            return 0;
        }

        const targetAmount = this[resourceName] + amount;
        this[resourceName] += amount;

        // Return actual amount added
        return amount - (targetAmount - this[resourceName]);
    }

    remove(resourceName, amount) {
        if (!this.valid(resourceName)) {
            return 0;
        }

        const targetAmount = this[resourceName] - amount;
        this[resourceName] -= amount;

        // Return actual amount removed
        return amount + (targetAmount - this[resourceName]);
    }

    has(resourceName, amount) {
        return this.valid(resourceName) && (this[resourceName] >= amount);
    }

    takeFrom(target, resourceName, amount = Infinity) {
        this.constructor.verifyResourceContainer(target, "target");
        if (!target[resourceName]) {
            return false;
        }
        const amountToTake = Math.min(target[resourceName], amount) || 0;
        this.add(resourceName, amountToTake);
        target.remove(resourceName, amountToTake);
        return true;
    }

    takeAllFrom(target) {
        this.constructor.verifyResourceContainer(target, "target");
        const resources = Object.entries(target.list);
        let amountToTake = 0;
        resources.forEach(resource => {
            amountToTake = target[resource[0]];
            this.add(resource[0], amountToTake);
            target.remove(resource[0], amountToTake);
        });
    }

    removeResources(resources) {
        const resourceList = Object.entries(resources);
        if (resourceList.some(resource => {
            // Check if each
            return !this.has(resource[0], resource[1]);
        })) {
            // Not enough in this container to remove everything
            return false;
        }
        resourceList.forEach(resource => {
            if (this.remove(resource[0], resource[1]) !== resource[1]) {
                throw new Exception("Error removing resource " + JSON.stringify(resource));
            }
        });
        return true;
    }
    
}