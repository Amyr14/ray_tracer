import { dot, add, sub, normalize, mag, scalarMult, invert, reflect, clamp, elemWiseMult } from "./linearAlg.js";

const WIDTH = 400;
const HEIGHT = 400;
const FOCAL_LENGTH = 80;
const MAX_STEPS = 20;
const FOCAL_POINT = [0, 0, 0];
const AMBIENT_LIGHT = [0.3, 0.3, 0.3];
const EPSILON = 1e-5;

const LIGHTS = [
  {
    position: [-55, -10, 60],
    intensity: [1, 1, 1],
  }
];

const SPHERES = [
  {
    center: [0, 40, 60],
    radius: 30,
    material: {
      reflectivity: 0.8,
      roughness: 0.5,
      ambientCoeff: 0.8,
      color: [1, 0, 0],
    }
  },
  {
    center: [-70, 20, 60],
    radius: 20,
    material: {
      reflectivity: 0.9,
      roughness: 0.5,
      ambientCoeff: 0.8,
      color: [0, 0, 1],
    }
  },
  {
    center: [20, -40, 60],
    radius: 30,
    material: {
      reflectivity: 1,
      roughness: 0.5,
      ambientCoeff: 0.8,
      color: [1, 1, 0],
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

  if ( delta >= 0 ) {
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

function isInShadow(point, light, normal) {
  /*
    Recebe um ponto e uma luz. Retorna
    true se o ponto está em sombra em
    relação a luz, e retorna falso se
    o ponto é iluminado pela luz
  */

  // Esse passo é necessário para evitar ruído na imagem final
  let offsetedPoint = add(point, scalarMult(normal, EPSILON));

  let direction = normalize(sub(light.position, offsetedPoint));
  let shadowRay = createRay(offsetedPoint, direction);
  let hitReport = closestRayHit(shadowRay);
  return hitReport.hit;
}

function shade(point, sphere) {
  /* 
    Realiza o cálculo de iluminação ambiente
    e difusa
   */
  let normal = normalize(sub(point, sphere.center));
  let { ambientCoeff, roughness, color } = sphere.material;
  let ambient = scalarMult(elemWiseMult(AMBIENT_LIGHT, color), ambientCoeff);

  let diffuseContrib = LIGHTS.map(light => {
    if ( isInShadow(point, light, normal) )
      return [0, 0 ,0];

    let lightToPoint = normalize(sub(light.position, point));
    let diffuse = scalarMult(scalarMult(elemWiseMult(light.intensity, color), roughness), dot(normal, lightToPoint));
    return diffuse;
  })

  let diffuse = diffuseContrib.reduce((acc, intensity) => add(acc, intensity), [0, 0, 0])
  let finalLighting = add(ambient, diffuse);

  return clamp(finalLighting, 0, 1);
}

function pointOnRay(ray, distance) {
  // Retorna um ponto no espaço a partir de um raio e uma distância
  return add(ray.origin, scalarMult(ray.direction, distance));
}


function castRay(ray, steps) {
  /*
    Retorna a cor RGB de um raio castado
    na cena
  */
  if ( steps > MAX_STEPS )
    return [0, 0, 0];

  let { hit, hitPoint, distance, sphere } = closestRayHit(ray);

  if ( !hit )
    return [0, 0, 0];

  let { reflectivity } = sphere.material;

  // Calculando sombreamento
  let color = shade(hitPoint, sphere);

  // Calculando raio de reflexão
  let normal = normalize(sub(hitPoint, sphere.center));
  let reflection = reflect(invert(ray.direction), normal);
  let reflectionRay = createRay(hitPoint, reflection);

  // Calculando cor
  let reflectedColor = scalarMult(castRay(reflectionRay, steps + 1), reflectivity);
  return clamp(add(color, reflectedColor), 0, 1);
}

export function calculatePixels() {
  let pixels = Array(HEIGHT).fill(0).map(() => Array(WIDTH).fill(0).map(() => { return [0, 0, 0] }));

  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {

      /*
        Mapeando as coordenadas dos pixels para o espaço
        da câmera. Esse mapeamento produz muito FOV, o que
        faz com que a imagem final apresente uma distorção
        de pin-cushion
      */
      let x = j - WIDTH / 2;
      let y = i - HEIGHT / 2;
      let direction = normalize([x, y, FOCAL_LENGTH]);
      let ray = createRay(FOCAL_POINT, direction);

      let color = castRay(ray, 0);
      pixels[i][j] = scalarMult(color, 255);
    }
  }

  return pixels;
}