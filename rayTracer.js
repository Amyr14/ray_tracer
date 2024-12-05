import { dot, add, sub, normalize, mag, scalarMult, invert, reflect, clamp } from "./linearAlg.js";

const WIDTH = 400;
const HEIGHT = 400;
const FOCAL_LENGTH = 50;
const MAX_STEPS = 10;
const LIGHTS = [];
const FOCAL_POINT = [0, 0, 0];
const SPHERES = [
  {
    type: "sphere",
    center: [0, 40, 60],
    radius: 30,
    color: [255, 0, 0],
    material: {
      reflectivity: 0.8
    }
  },
  {
    type: "sphere",
    center: [-70, 20, 60],
    radius: 35,
    color: [255, 255, 0],
    material: {
      reflectivity: 0.9
    }
  },
  {
    type: "sphere",
    center: [20, -50, 50],
    radius: 30,
    color: [0, 0, 255],
    material: {
      reflectivity: 1
    }
  },
]

function smallestPositive(x, y) {
  if (x > 0 && x < y) return x;
  if (y > 0 && y < x) return y;
  return null;
}

// Retorna a intersecção mais próxima de um raio com uma esfera
function raySphereHit(ray, sphere) {

  // Equação de intersecção linha - esfera

  let distance;
  let hit = false;
  let commonTerm = dot(ray.direction, sub(ray.origin, sphere.center));
  let delta = commonTerm ** 2 - (mag(sub(ray.origin, sphere.center)) ** 2 - sphere.radius ** 2);

  if (delta >= 0) {
    let d1 = -commonTerm + Math.sqrt(delta);
    let d2 = -commonTerm - Math.sqrt(delta);
    distance = smallestPositive(d1, d2)
    if (distance) hit = true;
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

// Retorna, se existe, o hit mais próximo da câmera
function closestRayHit(ray) {
  let closestHit = {
    hit: false,
    hitPoint: null,
    distance: Infinity,
    sphere: null,
  };

  SPHERES.forEach(sphere => {
    let hitReport = raySphereHit(ray, sphere);

    if (hitReport.hit && hitReport.distance < closestHit.distance)
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

// Retorna a cor RGB do raio
function castRay(ray, steps) {
  if (steps > MAX_STEPS)
    return [0, 0, 0];

  let { hit, hitPoint, distance, sphere } = closestRayHit(ray);

  if ( !hit )
    return [0, 0, 0];

  let { reflectivity } = sphere.material;

  // Calculando raio de reflexão
  let normal = normalize(sub(hitPoint, sphere.center));
  let reflection = reflect(invert(ray.direction), normal);
  let reflectionRay = createRay(hitPoint, reflection);

  // Calculando cor
  let reflectedColor = scalarMult(castRay(reflectionRay, steps + 1), reflectivity);
  return clamp(add(sphere.color, reflectedColor), 0, 255);
}

// Calcula e casta raios para cada pixel da câmera
export function calculatePixels() {
  let pixels = Array(HEIGHT).fill(0).map(() => Array(WIDTH).fill(0).map(() => { return [0, 0, 0] }));

  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {

      // Coordenadas dos pixels no espaço
      // Talvez seja necessário revisar isso
      let x = j - WIDTH / 2;
      let y = i - HEIGHT / 2;
      let direction = normalize([x, y, FOCAL_LENGTH]);
      let ray = createRay(FOCAL_POINT, direction);

      let color = castRay(ray, 0);
      pixels[i][j] = color;
    }
  }

  return pixels;
}