import { dot, add, sub, normalize, mag, scalarMult, invert } from "./linearAlg.js";

const WIDTH = 250;
const HEIGHT = 250;
const FOCAL_LENGTH = 50;
const MAX_STEPS = 10;
const LIGHTS = [];
const FOCAL_POINT = [0, 0, 0];
const SPHERES = [
    {
        type: "sphere",
        center: [0, 200, 100],
        radius: 40,
    },
]

function smallestPositive(x, y) {
  if ( x > 0 && x < y ) return x;
  if ( y > 0 && y < x ) return y;
  return null;
}

// Retorna a intersecção mais próxima.
// Se não houver nenhuma, retorna nulo.
function raySphereHit(ray, sphere) {
    // let sphereRay = sub(sphere.center, ray.origin);
    // let distToClosestPointOnRay = dot(sphereRay, ray.direction);
    // let closestPoint = pointOnRay(ray, distToClosestPointOnRay); // revisar
    // let distCenterToClosest = mag(sub(closestPoint, sphere.center)); // sphere.center
    // let hitDist = distToClosestPointOnRay - Math.sqrt(Math.abs(sphere.radius**2 - distCenterToClosest**2));
    // let hitPoint = pointOnRay(ray, hitDist);
    // let hit = hitDist > 0 && distCenterToClosest <= sphere.radius;

    // Equação de intersecção linha - esfera

    let distance;
    let hit = false;
    let commonTerm = dot(ray.direction, sub(ray.origin, sphere.center));
    let delta = commonTerm**2 - (mag(sub(ray.origin, sphere.center))**2 - sphere.radius**2);

    if ( delta >= 0 ) {
      let d1 = -commonTerm + Math.sqrt(delta);
      let d2 = -commonTerm - Math.sqrt(delta);
      distance = smallestPositive(d1, d2)
      if ( distance ) hit = true;
    }

    return {
      hit: hit,
      distance: distance,
      hitPoint: hit ? pointOnRay(ray, distance) : null,
      sphere: hit ? sphere : null,
    };
}

function createRay(origin, direction) {
    return {
        type: "ray",
        origin: origin,
        direction: direction,
    }
}

function createSphere(center, radius, material) {
    return {
        type: "sphere",
        center: center,
        radius: radius,
        material: material
    }
}

function createLight(position, intensity) {
    return {
        type: "light",
        position: position,
        intensity: intensity,
    }
}

// Retorna um par (ponto, objeto), onde o ponto
// é o ponto de intersecção mais próximo que o
// raio atinge, e o objeto é o objeto atingindo.
// Se nada é atingido, retorna nulo.
function closestRayHit(ray) {
    let closestHit = {
      hit: false,
      hitPoint: null,
      distance: Infinity,
      sphere: null,
    };

    SPHERES.forEach(sphere => {
        let hitReport = raySphereHit(ray, sphere);

        if ( hitReport.hit && hitReport.distance < closestHit.distance)
            closestHit = hitReport;
    })

    return closestHit;
}

// Retorna uma máscara booleana do mesmo formato
// que o vetor lights, informando quais fontes
// de luz devem contribuir para o cálculo da
// iluminação.
function getShadowMask(point) {
    let shadowMask = LIGHTS.map(light => {
        let direction = normalize(sub(light, point));
        let shadowRay = createRay(point, direction);
        let noHits = !closestRayHit(shadowRay);
        return noHits;
    })
    return shadowMask;
}

// function shade(point, sphere) {
//     let color = [0, 0, 0];
//     let normal = normalize(sub(point, sphere.center));
//     let shadowMask = getShadowMask(point);

//     for (let i = 0; i < lights.length; i++) {
//         if ( !shadowMask[i] )
//             continue;
        
//         let light = lights[i];
//         light.forEach(emmision, channel => {
            
//         })
//     }
// }

// Retorna um ponto no espaço a partir de um raio e uma distância
function pointOnRay(ray, distance) {
    return add(ray.origin, scalarMult(ray.direction, distance));
}

// Calcula o vetor de reflexão
function getReflectionRay(ray, hitPoint, sphereHit) {
    let v = invert(ray.direction);
    let normal = normalize(sub(hitPoint, sphereHit.center));
    let maxReflection = sub(v, scalarMult(2 * dot(v, normal), normal));
    return maxReflection;
}

// Retorna a cor RGB do raio
function castRay(ray, steps) {
    // if ( steps > MAX_STEPS )
    //     return [0, 0, 0];

    let hitReport = closestRayHit(ray);

    if ( !hitReport.hit )
      return [0, 0, 0];
    
    return [255, 255, 255];
}

// Calcula e casta raios para cada pixel da câmera
export function calculatePixels() {
    let pixels = Array(250).fill(0).map(()=>Array(250).fill(0).map(()=>{return [0,0,0]}));
    
    for(let i = 0; i < HEIGHT; i++) {
        for(let j = 0; j < WIDTH; j++) {

            // Coordenadas dos pixels no espaço
            // Talvez seja necessário revisar isso
            let x = j - WIDTH/2;
            let y = i - HEIGHT/2;
            let direction = normalize([x, y, FOCAL_LENGTH]);
            let ray = createRay(FOCAL_POINT, direction);

            let color = castRay(ray, MAX_STEPS);
            pixels[i][j] = color;
        }
    }

    return pixels;
}