import { AttractorTypes } from './simulation.js';

export const Equations = {
    [AttractorTypes.HALVORSEN]: String.raw`
        \begin{aligned}
        \dot{x} &= -ax - 4y - 4z - y^2 \\
        \dot{y} &= -ay - 4z - 4x - z^2 \\
        \dot{z} &= -az - 4x - 4y - x^2
        \end{aligned}
    `,
    [AttractorTypes.LORENZ]: String.raw`
        \begin{aligned}
        \dot{x} &= \sigma(y - x) \\
        \dot{y} &= x(\rho - z) - y \\
        \dot{z} &= xy - \beta z
        \end{aligned}
    `,
    [AttractorTypes.CHEN]: String.raw`
        \begin{aligned}
        \dot{x} &= a(y - x) \\
        \dot{y} &= (c - a)x - xz + cy \\
        \dot{z} &= xy - bz
        \end{aligned}
    `,
    [AttractorTypes.THOMAS]: String.raw`
        \begin{aligned}
        \dot{x} &= \sin(y) - bx \\
        \dot{y} &= \sin(z) - by \\
        \dot{z} &= \sin(x) - bz
        \end{aligned}
    `
};
