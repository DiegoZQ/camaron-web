"use strict";


// Fuente: https://www.geeksforgeeks.org/minimum-enclosing-circle-using-welzls-algorithm/


// Structure to represent a 2D circle
class Circle {
    constructor(point2D, radius) {
        this.center = point2D;
        this.radius = radius;
    }
};


// Obtiene el centro de un círculo dado 3 puntos
// utilizando la ecuación (x-h)^2 + (y-k)^2 - r^2 = 0.
// TODO: ver por qué esto funciona.
const circleCenter = (ax, ay, bx, by, cx, cy) => {
    bx = bx - ax; 
    by = by - ay;
    cx = cx - ax;
    cy = cy - ay;
    let B = bx * bx + by * by;
    let C = cx * cx + cy * cy;
    let D = bx * cy - by * cx;

    const h = ((cy * B - by * C) / (2 * D)) + ax;
    const k = ((bx * C - cx * B) / (2 * D)) + ay;

    return [h, k];
}

// Retorna un círculo que intersecta 3 puntos A,B,C.
const circleFrom3Points = (ax, ay, bx, by, cx, cy) => {
    const center = circleCenter(ax, ay, bx, by, cx, cy);
    return new Circle(center, vec2.dist(center, [ax, ay]));
}
 
// Retorna un círculo que intersecta 2 puntos A,B.
// Se asume que la distancia entre ambos corresponde al diámetro del círculo.
const circleFrom2Points = (ax, ay, bx, by) => {
    const center = [(ax+bx)/2, (ay+by)/2];
    return new Circle(center, vec2.dist([ax,ay], [bx, by])/2);
}

// Verifica que el círculo encierre todos los puntos.
const isValidCircle = (circle, points2D) => {
    for (let i = 0; i < points2D.length; i+=1) {
        const point = [points2D[2*i], points2D[2*i + 1]];
        if (vec2.dist(point, circle.center) > circle.radius) {
            return false;
        }
    }
    return true;
}

// Retorna el círculo de radio mínimo que encierra 3 o menos puntos.
const minCircleTrivial = (points2D) => {
    const point2DLength = points2D.length/2;
    if (point2DLength == 0) {
        return new Circle([0,0], 0);
    }
    if (point2DLength == 1) {
        return new Circle(points2D, 0);
    }
    if (point2DLength == 2) {
        return circleFrom2Points(...points2D);
    }
    // Revisa si se puede calcular el radio sólo con 2 puntos.
    for (let i = 0; i < 3; i++) {
        const firstPoint = [points2D[2*i], points2D[2*i + 1]];
        for (let j = i + 1; j < 3; j++) {
            const secondPoint = [points2D[2*j], points2D[2*j + 1]];
            const circle = circleFrom2Points(...firstPoint, ...secondPoint);
            if (isValidCircle(circle, points2D)) {
                return circle;
            }
        }
    }
    return circleFrom3Points(...points2D);
}

// Returns the MEC using Welzl's algorithm. Takes a set of input points P and a set R
// points on the circle boundary. n represents the number of points in P that are not yet processed.
const welzlHelper = (points2D, boundedPoints2D) => {
    // Caso base cuando todos los puntos se han procesado o |R| = 3, 
    // lo que significa que ya se tienen 3 puntos en el borde del círculo y no necesitamos más.
    if (points2D.length == 0 || boundedPoints2D.length == 3*2) {
        return minCircleTrivial(boundedPoints2D);
    }
    
    const y = points2D.pop();
    const x = points2D.pop();
    const point = [x,y];

    // Obtiene el MEC circle del set de puntos actual menos el último punto.
    const circle = welzlHelper(points2D, boundedPoints2D);
    // Si el círculo creado sin considerar este último punto lo contiene, entonces este no es parte de los bordes.
    if (vec2.dist(circle.center, point) <= circle.radius) {
        points2D.push(...point); // DIFFERENT Restore point
        return circle;
    }
    // Si no lo contiene, entonces el punto random pertenece a los bordes del circumradius.
    boundedPoints2D.push(...point);
    // Retorna el MEC circle para el círculo creado sin considerar este punto random y contándolo dentro de los puntos bordes del círculo  
    const newCircle = welzlHelper(points2D, boundedPoints2D);
    boundedPoints2D.pop(); // DIFFERENT
    boundedPoints2D.pop(); // DIFFERENT
    points2D.push(...point); // DIFFERENT Restore point
    return newCircle;
}

const getPolygonCircumradius = (polygon) => {
    const points2D = polygon.vertices2D;
    const points2DCopy = [...points2D];
    return welzlHelper(points2DCopy, []).radius;
}