import * as THREE from 'three';

export class TrailRenderer {
    constructor(scene, maxTrails = 100, trailLength = 200) {
        this.maxTrails = maxTrails;
        this.trailLength = trailLength;
        this.scene = scene;
        this.active = false;

        // We'll use a single BufferGeometry for all trails to minimize draw calls
        // Or simpler: one Line per trail. For 100 lines it's fine.
        // Let's use one Line per trail for simplicity of updating circular buffers.

        this.trails = [];
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        for (let i = 0; i < maxTrails; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(trailLength * 3);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const line = new THREE.Line(geometry, material);
            line.frustumCulled = false; // Optimization: always draw
            line.visible = false;

            this.scene.add(line);

            this.trails.push({
                mesh: line,
                positions: positions,
                currentIdx: 0,
                full: false
            });
        }
    }

    reset() {
        this.trails.forEach(trail => {
            trail.currentIdx = 0;
            trail.full = false;
            trail.mesh.visible = false;
        });
    }

    setActive(active) {
        this.active = active;
        if (!active) {
            this.trails.forEach(t => t.mesh.visible = false);
        }
    }

    update(particlePositions, count) {
        if (!this.active) return;

        // Track the first N particles as "heroes"
        const numToTrack = Math.min(count, this.maxTrails);

        for (let i = 0; i < numToTrack; i++) {
            const trail = this.trails[i];
            trail.mesh.visible = true;

            const i3 = i * 3;
            const x = particlePositions[i3];
            const y = particlePositions[i3 + 1];
            const z = particlePositions[i3 + 2];

            // Update circular buffer logic or just shift?
            // Shifting is expensive (O(N*L)). Circular buffer is O(N).
            // But THREE.Line needs contiguous data usually.
            // Let's just shift for 200 points, it's negligible in JS for 100 lines.

            // Shift
            for (let j = this.trailLength - 1; j > 0; j--) {
                const j3 = j * 3;
                const prev3 = (j - 1) * 3;
                trail.positions[j3] = trail.positions[prev3];
                trail.positions[j3 + 1] = trail.positions[prev3 + 1];
                trail.positions[j3 + 2] = trail.positions[prev3 + 2];
            }

            // Set new head
            trail.positions[0] = x;
            trail.positions[1] = y;
            trail.positions[2] = z;

            trail.mesh.geometry.attributes.position.needsUpdate = true;
        }
    }
}
