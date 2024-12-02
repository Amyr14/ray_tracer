
export function add([x, y, z], [w, j, k]) {
    return [x + w, y + j, z + k];
}

export function sub([x, y, z], [w, j, k]) {
    return add([x, y, z], [-w, -j, -k]);
}

export function scalarMult([x, y, z], s) {
    return [s*x, s*y, s*z];
}

export function mag([x, y, z]) {
    return Math.sqrt(x*x + y*y + z*z);
}

export function normalize(v) {
    return scalarMult(v, 1/mag(v));
}

export function dot([x, y, z], [w, j, k]) {
    return x*w + y*j + z*k;
}

export function invert([x, y, z]) {
    return [-x, -y, -z];
}