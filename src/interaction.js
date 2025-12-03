import * as THREE from 'three';

export class InteractionHandler {
    constructor(camera, canvas, particleSystem) {
        this.camera = camera;
        this.canvas = canvas;
        this.particles = particleSystem;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Default plane at z=0

        this.isMouseDown = false;
        this.mode = 'spawn'; // 'spawn' or 'disturb'

        this.initEvents();
    }

    initEvents() {
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    }

    getIntersects(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Raycast against an invisible plane facing the camera to find 3D point
        const target = new THREE.Vector3();
        this.plane.normal.copy(this.camera.position).normalize();
        this.raycaster.ray.intersectPlane(this.plane, target);

        return target;
    }

    onMouseMove(event) {
        if (this.isMouseDown && this.mode === 'disturb') {
            // Logic for disturbing particles could go here or in update loop
            // For now, let's just track the mouse position
        }
    }

    onMouseDown(event) {
        this.isMouseDown = true;
    }

    onMouseUp(event) {
        this.isMouseDown = false;
    }

    onDoubleClick(event) {
        const target = this.getIntersects(event);
        if (target) {
            // Spawn burst
            this.particles.spawn(500, target, 2.0);
        }
    }
}
