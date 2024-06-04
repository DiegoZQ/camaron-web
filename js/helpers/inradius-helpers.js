"use strict";


// Fuente: https://github.com/mapbox/polylabel/blob/master/polylabel.js


// Obtiene la distancia al cuadrado de un punto a un segmento en 2D.
const getSegDistSq = (px, py, a, b) => {
    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;

    if (dx !== 0 || dy !== 0) {
        const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            x = b[0];
            y = b[1];
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }
    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

// Calcula la distancia de un punto a los bordes de un polígono, ambos en un mismo plano.
// Si la distancia es positiva, está dentro del polígono, si la distancia es negativa, está fuera del polígono.
const pointToPolygonDist = (point, polygon) => {
    if (point.length == 3) {
        const {u, v} = polygon.basisVectors;
        point = mapTo2D(point, u, v);
    }
    const [x, y] = point;
    const vertices2D = polygon.vertices2D;

    let inside = false;
    let minDistSq = Infinity;

    const rings = polygon.holes.length ? polygon.holes : [polygon.vertices.length];

    for (let k = 0; k < rings.length; k++) {
       const start = k == 0 ? 0 : rings[k-1];
       const end = rings[k]; 
 
       for (let i = start, j = end - 1; i < end; j = i++) {
          const ax = vertices2D[2*i], ay = vertices2D[2*i + 1];
          const bx = vertices2D[2*j], by = vertices2D[2*j + 1]; 

          if ((ay > y !== by > y) &&
             (x - ax < (y - ay) * (bx - ax) / (by - ay))) inside = !inside;

          minDistSq = Math.min(minDistSq, getSegDistSq(x, y, [ax,ay], [bx,by]));
       }
    }
    return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// Una celda representa un cuadrado de largo 2*h cuyo centro es el punto x,y, y que a su vez, es parte de una 
// partición de celdas realizada sobre el bounding box de un polígono 3D.
class Cell {
    constructor(x, y, h, polygon) {
        this.x = x; // cell center x
        this.y = y; // cell center y
        this.h = h; // half the cell size
        // Distancia del centro de la celda al borde más cercano del polígono.
        this.d = pointToPolygonDist([x,y], polygon);
        // Distancia del centro de la celda al borde más cercano del polígono + distancia del centro de la celda a una esquina del cuadrado.
        // Representa la distancia potencial que puede llegar a alcanzar en el mejor de los casos el centro de la celda con un borde del polígono.
        this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
    }
}


// This function calculates the inradius of a polygon with a given precision.
// The inradius is the radius of the largest circle that can be inscribed within the polygon.
// The closer the precision value is to 0, the more accurate the inradius will be.
// The algorithm uses a quadtree-like approach to iteratively refine the search area 
// by dividing the polygon into smaller cells and evaluating their potential to contain the circle's center.
const polygonInradius = (polygon, precision) => {
    const {u, v} = polygon.basisVectors;
    // Obtiene el bounding box 2D del polígono.
    const vertices2D = polygon.vertices2D;
    let minX, minY, maxX, maxY;
    const outerRingLength = polygon.holes.length ? polygon.holes[0] : polygon.vertices.length;
    for (let i = 0; i < outerRingLength; i++) {
        const px = vertices2D[2*i], py = vertices2D[2*i + 1];  
        if (!i || px < minX) minX = px;
        if (!i || py < minY) minY = py;
        if (!i || px > maxX) maxX = px;
        if (!i || py > maxY) maxY = py;
    }
               
    // Obtiene el tamaño de cada celda
    const width = maxX - minX;
    const height = maxY - minY;
    const cellSize = Math.min(width, height);
    let h = cellSize / 2;
      
    if (cellSize === 0) {
        return 0;
    }
    
    // Crea una priority queue que ordena las celdas según su potencial,
    // que es la distancia del centro al borde del polígono + la distancia del centro a un borde de la celda.
    const cellQueue = new TinyQueue(undefined, (a,b) => b.max - a.max);
      
    // Toma el centroide como la mejor opción inicial.
    let bestCell = new Cell(...mapTo2D(polygon.geometricCenter, u, v), 0, polygon);
    // Y el centroide de la bounding box como segunda mejor opción.
    const bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
    if (bboxCell.max > bestCell.max) bestCell = bboxCell;
      
     // Divide el polígono en las celdas iniciales
    for (let x = minX; x < maxX; x += cellSize) {
        for (var y = minY; y < maxY; y += cellSize) {
            const cell = new Cell(x+h, y+h, h, polygon);
                cellQueue.push(cell);
        }
    }
            
    while (cellQueue.length) {
        // Obtiene la celda más prometedora
        const cell = cellQueue.pop();
        // Modifica la mejor celda si se encuentra una mejor
        if (cell.d > bestCell.d) {
            bestCell = cell;
        }
        // No sigue particionando la celda si su potencial es menor a la distancia de la mejor celda + un epsilon. 
        if (cell.max <= bestCell.d + precision) continue;
        // En otro caso, separa la celda en 4 celdas más pequeñas con la mitad del largo.
        // Notar que el potencial cell.max es a lo más cell.d + la distancia del centro a una punta de la celda, ya que si fuera
        // mayor, sí o sí tendría que estar en otra celda, otra celda cuya distancia al borde es menor o igual que la celda a actual
        // por lo que la distancia real de la celda inicial se acortaría.
        h = cell.h / 2;
        cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon));
        cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon));
        cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon));
        cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon));
    }

    return Math.max(bestCell.d, 0);
}