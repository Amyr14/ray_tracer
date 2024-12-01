
export function add([x, y, z], [w, j, k]) {
    return [x + w, y + j, z + k];
}

export function sub([x, y, z], [w, j, k]) {
    return add([x, y, z], [-w, -j, -k]);
}

export function scalar_mult([x, y, z], s) {
    return [s*x, s*y, s*z];
}

export function mag([x, y, z]) {
    return Math.sqrt(x*x + y*y + z*z);
}

export function normalize([x, y, z]) {
    return scalar_mult([x, y, z], 1/mag([x, y, z]));
}

export function dot([x, y, z], [w, j, k]) {
    return x*w + y*j + z*k;
}