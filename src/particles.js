import * as THREE from 'three';

export const Palettes = {
    NEON: {
        name: 'Neon',
        getColor: (x, y, z, v) => {
            return [
                0.2 + Math.abs(Math.sin(x * 0.1)),
                0.5 + Math.abs(Math.cos(y * 0.1)) * 0.5,
                0.6 + Math.abs(Math.sin(z * 0.1)) * 0.4
            ];
        }
    },
    FIRE: {
        name: 'Fire',
        getColor: (x, y, z, v) => {
            const t = Math.min(1, v * 0.05); // Speed based
            return [
                1.0,
                0.1 + t * 0.9,
                0.0 + t * 0.2
            ];
        }
    },
    OCEAN: {
        name: 'Ocean',
        getColor: (x, y, z, v) => {
            return [
                0.0 + Math.abs(Math.sin(z * 0.05)) * 0.2,
                0.4 + Math.abs(Math.cos(x * 0.05)) * 0.6,
                0.8 + Math.abs(Math.sin(y * 0.05)) * 0.2
            ];
        }
    },
    MATRIX: {
        name: 'Matrix',
        getColor: (x, y, z, v) => {
            return [
                0.0,
                0.5 + Math.random() * 0.5,
                0.0
            ];
        }
    },
    SPECTRAL: {
        name: 'Spectral',
        getColor: (x, y, z, v) => {
            const hue = (x + y + z) * 0.01;
            const color = new THREE.Color().setHSL(hue % 1, 1.0, 0.5);
            return [color.r, color.g, color.b];
        }
    },
    CYBERPUNK: {
        name: 'Cyberpunk',
        getColor: (x, y, z, v) => {
            // Neon Pink/Blue/Yellow
            const t = (Math.sin(x * 0.1) + 1) * 0.5;
            if (t < 0.33) return [1.0, 0.0, 0.8]; // Pink
            if (t < 0.66) return [0.0, 0.8, 1.0]; // Cyan
            return [1.0, 0.9, 0.0]; // Yellow
        }
    },
    WASTELAND: {
        name: 'Wasteland',
        getColor: (x, y, z, v) => {
            // Rust, Orange, Brown, Grey
            const n = (Math.sin(z * 0.05) + 1) * 0.5;
            return [
                0.6 + n * 0.4, // Reddish
                0.3 + n * 0.2, // Brownish
                0.1 + n * 0.1  // Dark
            ];
        }
    },
    VOID: {
        name: 'Void',
        getColor: (x, y, z, v) => {
            // Deep Purple, Black, Dark Blue
            const mag = Math.sqrt(x * x + y * y + z * z) * 0.02;
            return [
                0.1 + mag * 0.2,
                0.0,
                0.2 + mag * 0.4
            ];
        }
    },
    RADIOACTIVE: {
        name: 'Radioactive',
        getColor: (x, y, z, v) => {
            // Sickly Green, Yellow, Black
            const pulse = (Math.sin(v * 0.1) + 1) * 0.5;
            return [
                pulse * 0.2,
                0.8 + pulse * 0.2,
                0.0
            ];
        }
    }
};

export class ParticleSystem {
    constructor(scene, maxParticles = 50000) {
        this.maxParticles = maxParticles;
        this.activeCount = 0;
        this.scene = scene;
        this.palette = Palettes.NEON;

        // Geometry setup
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setDrawRange(0, 0);

        // Material setup
        this.material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        scene.add(this.mesh);
    }

    setPalette(paletteName) {
        if (Palettes[paletteName]) {
            this.palette = Palettes[paletteName];
        }
    }

    reset() {
        this.activeCount = 0;
        this.geometry.setDrawRange(0, 0);
    }

    spawn(count, center = new THREE.Vector3(0, 0, 0), spread = 0.5) {
        const start = this.activeCount;
        const end = Math.min(this.activeCount + count, this.maxParticles);

        for (let i = start; i < end; i++) {
            const i3 = i * 3;
            this.positions[i3] = center.x + (Math.random() - 0.5) * spread;
            this.positions[i3 + 1] = center.y + (Math.random() - 0.5) * spread;
            this.positions[i3 + 2] = center.z + (Math.random() - 0.5) * spread;

            this.colors[i3] = 1.0;
            this.colors[i3 + 1] = 1.0;
            this.colors[i3 + 2] = 1.0;
        }

        this.activeCount = end;
        this.geometry.setDrawRange(0, this.activeCount);
    }

    update(simulation, dt, substeps = 1) {
        if (this.activeCount === 0) return;

        const positions = this.positions;
        const colors = this.colors;
        const count = this.activeCount;
        const subDt = dt / substeps;

        let x, y, z;
        let v;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            x = positions[i3];
            y = positions[i3 + 1];
            z = positions[i3 + 2];

            for (let s = 0; s < substeps; s++) {
                // RK4 Integration
                // k1
                const k1 = simulation.getDerivatives(x, y, z);

                // k2
                const k2 = simulation.getDerivatives(
                    x + k1.dx * subDt * 0.5,
                    y + k1.dy * subDt * 0.5,
                    z + k1.dz * subDt * 0.5
                );

                // k3
                const k3 = simulation.getDerivatives(
                    x + k2.dx * subDt * 0.5,
                    y + k2.dy * subDt * 0.5,
                    z + k2.dz * subDt * 0.5
                );

                // k4
                const k4 = simulation.getDerivatives(
                    x + k3.dx * subDt,
                    y + k3.dy * subDt,
                    z + k3.dz * subDt
                );

                x += (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx) * subDt / 6;
                y += (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy) * subDt / 6;
                z += (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz) * subDt / 6;
            }

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // Calculate velocity magnitude for color mapping
            v = Math.sqrt(x * x + y * y + z * z); // Approximation using position magnitude for now as proxy for energy

            const [r, g, b] = this.palette.getColor(x, y, z, v);
            colors[i3] = r;
            colors[i3 + 1] = g;
            colors[i3 + 2] = b;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }
}
