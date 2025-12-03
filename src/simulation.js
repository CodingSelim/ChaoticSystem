export const AttractorTypes = {
    HALVORSEN: 'halvorsen',
    LORENZ: 'lorenz',
    CHEN: 'chen',
    THOMAS: 'thomas'
};

export class Simulation {
    constructor(type = AttractorTypes.HALVORSEN) {
        this.type = type;
        this.params = {
            [AttractorTypes.HALVORSEN]: { a: 1.4 },
            [AttractorTypes.LORENZ]: { sigma: 10, rho: 28, beta: 8 / 3 },
            [AttractorTypes.CHEN]: { a: 40, b: 3, c: 28 },
            [AttractorTypes.THOMAS]: { b: 0.208186 }
        };
    }

    setAttractorType(type) {
        if (Object.values(AttractorTypes).includes(type)) {
            this.type = type;
        }
    }

    getDerivatives(x, y, z) {
        switch (this.type) {
            case AttractorTypes.LORENZ:
                return this.lorenz(x, y, z);
            case AttractorTypes.CHEN:
                return this.chen(x, y, z);
            case AttractorTypes.THOMAS:
                return this.thomas(x, y, z);
            case AttractorTypes.HALVORSEN:
            default:
                return this.halvorsen(x, y, z);
        }
    }

    halvorsen(x, y, z) {
        const { a } = this.params[AttractorTypes.HALVORSEN];
        return {
            dx: -a * x - 4 * y - 4 * z - y * y,
            dy: -a * y - 4 * z - 4 * x - z * z,
            dz: -a * z - 4 * x - 4 * y - x * x
        };
    }

    lorenz(x, y, z) {
        const { sigma, rho, beta } = this.params[AttractorTypes.LORENZ];
        return {
            dx: sigma * (y - x),
            dy: x * (rho - z) - y,
            dz: x * y - beta * z
        };
    }

    chen(x, y, z) {
        const { a, b, c } = this.params[AttractorTypes.CHEN];
        return {
            dx: a * (y - x),
            dy: (c - a) * x - x * z + c * y,
            dz: x * y - b * z
        };
    }

    thomas(x, y, z) {
        const { b } = this.params[AttractorTypes.THOMAS];
        return {
            dx: Math.sin(y) - b * x,
            dy: Math.sin(z) - b * y,
            dz: Math.sin(x) - b * z
        };
    }
}
