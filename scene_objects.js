import {sub, dot} from "./linear_alg.js";


export class SceneObject {
    constructor(color, reflexivity) {
        this.color = color;
        this.reflexivity = reflexivity
    }
}

export class Sphere extends SceneObject {
    constructor(center, radius, color, reflexivity) {
        super(color, reflexivity);
        this.center = center;
        this.radius = radius;
    }

    // O diretor precisa ser unitário
    lineIntersection(direction, origin) {
        const delta = dot(direction, sub(origin, this.center))**2 - (mag(sub(origin, this.center))**2 - this.radius**2);

        if ( delta < 0 )
            return null;

        const t1 = -dot(direction, sub(origin, center)) + Math.sqrt(delta);
        const t2 = -dot(direction, sub(origin, center)) - Math.sqrt(delta);

        return t1 <= t2 ? t1 : t2;
    }
}