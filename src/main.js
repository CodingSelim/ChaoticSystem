import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { Simulation, AttractorTypes } from './simulation.js';
import { ParticleSystem, Palettes } from './particles.js';
import { TrailRenderer } from './trails.js';
import { InteractionHandler } from './interaction.js';
import { Equations } from './equations.js';

class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.initThree();
        this.initPostProcessing();
        this.initSimulation();
        this.initInteraction();
        this.initUI();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        window.addEventListener('resize', this.onResize.bind(this));
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050505, 0.02);

        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 0, 40);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(bloomPass);
    }

    initSimulation() {
        this.simulation = new Simulation(AttractorTypes.HALVORSEN);
        this.particles = new ParticleSystem(this.scene, 50000);
        this.trails = new TrailRenderer(this.scene, 50, 150);

        // Initial spawn
        this.particles.spawn(50000, new THREE.Vector3(0, 0, 0), 0.5);

        document.getElementById('stat-count').textContent = this.particles.activeCount;
        this.updateHeader();
        this.updateEquation();
    }

    initInteraction() {
        this.interaction = new InteractionHandler(this.camera, this.canvas, this.particles);
    }

    initUI() {
        const selectAttractor = document.getElementById('select-attractor');
        const selectPalette = document.getElementById('select-palette');
        const checkTrails = document.getElementById('check-trails');
        const paramA = document.getElementById('param-a');
        const valA = document.getElementById('val-a');
        const paramSpeed = document.getElementById('param-speed');
        const valSpeed = document.getElementById('val-speed');
        const btnReset = document.getElementById('btn-reset');

        this.speed = 1.0;

        selectAttractor.addEventListener('change', (e) => {
            this.simulation.setAttractorType(e.target.value);
            // Removed resetSimulation() to allow morphing
            this.updateHeader();
            this.updateEquation();
        });

        selectPalette.addEventListener('change', (e) => {
            this.particles.setPalette(e.target.value);
        });

        checkTrails.addEventListener('change', (e) => {
            this.trails.setActive(e.target.checked);
        });

        paramA.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            // Only update if current type is Halvorsen for now, or make generic param handler
            if (this.simulation.type === AttractorTypes.HALVORSEN) {
                this.simulation.params[AttractorTypes.HALVORSEN].a = val;
            }
            valA.textContent = val.toFixed(2);
        });

        paramSpeed.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.speed = val;
            valSpeed.textContent = val.toFixed(1) + 'x';
        });

        btnReset.addEventListener('click', () => {
            this.resetSimulation();
        });
    }

    resetSimulation() {
        this.particles.reset();
        this.trails.reset();
        this.particles.spawn(50000, new THREE.Vector3(0, 0, 0), 0.5);
        document.getElementById('stat-count').textContent = this.particles.activeCount;
    }

    updateHeader() {
        const title = document.getElementById('header-title');
        const type = this.simulation.type;
        // Capitalize first letter
        const name = type.charAt(0).toUpperCase() + type.slice(1);
        title.textContent = `${name} Attractor`;
    }

    updateEquation() {
        const container = document.getElementById('equation-container');
        const type = this.simulation.type;
        const latex = Equations[type];

        if (window.katex && latex) {
            window.katex.render(latex, container, {
                displayMode: true,
                throwOnError: false
            });
        }
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const dt = Math.min(this.clock.getDelta(), 0.1) * this.speed;

        // Update particles
        // Base dt 0.005 is good for Halvorsen, others might need tuning
        // We can adjust base dt per attractor type if needed
        let baseDt = 0.005;
        if (this.simulation.type === AttractorTypes.LORENZ) baseDt = 0.005;
        if (this.simulation.type === AttractorTypes.CHEN) baseDt = 0.002; // Chen is fast

        this.particles.update(this.simulation, baseDt * this.speed, 2);

        // Update trails
        this.trails.update(this.particles.positions, this.particles.activeCount);

        this.controls.update();
        this.composer.render();
    }
}

new App();
