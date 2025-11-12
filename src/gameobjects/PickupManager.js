export class PickupManager {
    constructor(scene, layerName, player) {
        this.scene = scene;
        this.player = player;
        this.group = scene.physics.add.staticGroup();

        const layer = scene.map.getObjectLayer(layerName);
        layer.objects.forEach(obj => {
            const x = obj.x;
            const y = obj.y - obj.height;
            const type = obj.type || obj.name;
            const pickup = this.group.create(x, y, type);
            pickup.setOrigin(0, 0);
            pickup.setData('type', type);
        });

        scene.physics.add.overlap(player, this.group, this.collect, null, this);
    }

    collect(player, pickup) {
        const type = pickup.getData('type');
        this.scene.events.emit('pickup', type);
        pickup.destroy();
    }
}
