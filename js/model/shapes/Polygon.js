"use strict";

// requires './Shape';
// requires '../external/gl-matrix';
// requires "../external/earcut";


class Polygon extends Shape {
   constructor(id) {
      super(id);
      this.vertices = [];
      this.polyhedrons = [];
      this._angles = null;
      this._area = null;
      this._normal = null;
      this._geometricCenter = null;
      this.neighbours = [];
      this._trianglesVertexIndices = [];
      this._trianglesVertexCoords = [];
      this._isConvex = null;
   }

   // Asume que el polígono es planar, ie, todos sus vértices se ubican en un mismo plano.
   calculateNormal() {
      this._normal = vec3.create();
      const u = vec3.create();
      const v = vec3.create();
      const vertices = this.vertices;
      const trianglesVertexIndices = this.trianglesVertexIndices;
      // Calcula el plano a partir de los vectores u, v que conforman un triángulo cualquiera del plano.
      // Como es planar, dicho plano es compartido por todos los demás triángulos.
      vec3.subtract(u, vertices[trianglesVertexIndices[1]].coords, vertices[trianglesVertexIndices[0]].coords); 
      vec3.subtract(v, vertices[trianglesVertexIndices[2]].coords, vertices[trianglesVertexIndices[0]].coords);
      vec3.cross(this._normal, u, v);
      vec3.normalize(this._normal, this._normal);
   }

   get normal() {
      if (this._normal == null) 
         this.calculateNormal();
      return vec3.clone(this._normal);
   }

   // Calcula el centro geométrico del polígono, para posteriormente asignarle una normal.
   calculateGeometricCenter() {
      const vertices = this.vertices;
      this._geometricCenter = vec3.create();
      // Suma todos los vértices del polígono y los promedia.
      for (const vertex of vertices) 
         vec3.add(this._geometricCenter, this._geometricCenter, vertex.coords);
      vec3.scale(this._geometricCenter, this._geometricCenter, 1 / vertices.length);
   }

   get geometricCenter() {
      if (this._geometricCenter == null) 
         this.calculateGeometricCenter();
      return vec3.clone(this._geometricCenter);
   }

   // Calcula el área de un polígono planar.
   calculateArea() {
      const total = vec3.create();
      const vertices = this.vertices;
      for (let i = 0; i < vertices.length; i++) {
         const v1 = vertices[i].coords;
         const v2 = vertices[(i + 1) % vertices.length].coords;
         const prod = vec3.create();
         vec3.cross(prod, v1, v2);
         vec3.add(total, total, prod);
      }
      const result = vec3.dot(total, this.normal);
      this._area = Math.abs(result / 2);
   }

   get area() {
      if (this._area == null) 
         this.calculateArea();
      return this._area;
   }

   // Obtiene los ángulos calculando las direcciones de giro entre los lados del polígono. Si este es convexo, sólo tendrá una dirección de giro
   // Si es no convexo, tendrá una dirección de giro mayoritaria y una minoritaria. La fórmula del ángulo por arista es:
   // vec3.angle(vector2, vector1) si el polígono es convexo o la dirección de giro es mayoritaria 
   // 2*Math.PI - vec3.angle(vector2, vector1) si el polígono es no convexo y la dirección de giro es minoritaria
   // donde vector 1 corresponde al vector que va del vértice anterior al actual y vector2 corresponde al vector que va desde el vértice actual al siguiente; 
   calculateAngles() {
      const vertices = this.vertices; 
      this._angles = new Array(vertices.length);
   
      const normals = [];
      for (let i = 0; i < vertices.length; i++) {
         const vertex1 = vertices[(i - 1 + vertices.length) % vertices.length].coords;
         const vertex2 = vertices[i].coords;
         const vertex3 = vertices[(i + 1) % vertices.length].coords;

         const vector1 = vec3.subtract(vec3.create(), vertex1, vertex2);
         const vector2 = vec3.subtract(vec3.create(), vertex3, vertex2);
         normals.push(vec3.cross(vec3.create(), vector2, vector1));
         this._angles[i] = vec3.angle(vector2, vector1);
      }
      const firstNormal = normals[0];
      const orientation = normals.map(normal => (firstNormal[0] * normal[0] >= 0 && firstNormal[1] * normal[1] >= 0 && firstNormal[2] * normal[2] >= 0) ? true : false);
      const positive = orientation.reduce((acc, val) => acc + val, 1); 
      const negative = vertices.length - positive;

      for (let i = 0; i < vertices.length; i++) {
         // Si el lado mayoritario es positivo, todos los ángulos cuya normal tenga orientación positiva, tendrán la forma this._angles[i];
         // Si el lado mayoritario es negativo, todos los ángulos cuya normal tenga orientación negativa, tendrán la forma this._angles[i];
         if (positive > negative == orientation[i]) {
            continue;
         }
         // Si el lado minoritario es positivo, todos los ángulos cuya normal tenga orientación positiva, tendrán la forma 2*Math.PI - this._angles[i];
         // Si el lado minoritario es negativo, todos los ángulos cuya normal tenga orientación negativa, tendrán la forma 2*Math.PI - this._angles[i]; 
         this._angles[i] = 2*Math.PI - this._angles[i];
      }
   }

   get angles() {
      if (this._angles == null) 
         this.calculateAngles();
      return this._angles;
   }

   isConvex() {
      if (this._isConvex == null) {
         this._isConvex = true;
         for (const angle of this.angles) {
            if (angle > Math.PI) {
               this._isConvex = false;
               break;
            }
         }      
      }
      return this._isConvex;
   }

   isNeighbour(polygon) {
      return this.neighbours.includes(polygon);
   }
            
   // Calcula los índices de los vértices de cada triángulo del polígono, cada 3 índices corresponde a un triángulo.
   // Para hacer esto, aplica triangulación de polígonos convexos o no convexos (utilizando earcut) según corresponda.
   calculateTrianglesVertexIndices() {
      const vertices = this.vertices;
      // Caso 1: triángulo, no requiere triangulación
      if (vertices.length === 3) {
         this._trianglesVertexIndices = [0,1,2];
      }
      // Caso 2: polígono convexo
      else if (this.isConvex()) {
         for (let i = 1; i < vertices.length - 1; i++) {
            // Create triangle with base vertex and adjacent vertices
            const triangle = [0, i, i+1];
            this._trianglesVertexIndices.push(...triangle);
        }
      }  
      // Caso 3: polígono no convexo
      else {
         const points3D = []
         const [u, v, vertexIndex] = findBasisVectorsFromVertices(vertices);
         // si los vectores base u, v encontrados, fueron sobre un vértice que comprende un ángulo de +180 grados,
         // se invierte la dirección de uno de los vectores base ya que el producto cruz de dichos vectores va en la dirección
         // MINORITARIA, la cual NO es representativa para determinar la orientación real del polígono.
         if (this.angles[vertexIndex] > Math.PI) {
            vec3.negate(v, v);
         }

         for (const vertex of vertices) {
            points3D.push(...vertex.coords);
         }
         const points2D = mapTo2D(points3D, u, v);
         this._trianglesVertexIndices = earcut(points2D, null);
      }
   }

   // Obtiene los índices de los vértices de cada triángulo, cada 3 índices corresponde a un triángulo.
   get trianglesVertexIndices() {
      if (!this._trianglesVertexIndices.length) 
         this.calculateTrianglesVertexIndices();
      return this._trianglesVertexIndices;
   }

   calculateTrianglesVertexCoords() {
      const vertices = this.vertices;
      const trianglesVertexIndices = this.trianglesVertexIndices;
      const orderedVertexCoords = [];
      for (const vertexIndex of trianglesVertexIndices) {
         const coords = vertices[vertexIndex].coords;
         orderedVertexCoords.push(coords[0], coords[1], coords[2]);
      }
      this._trianglesVertexCoords = orderedVertexCoords;
   }

   // Similar a getTriangleVertexIndices, sólo que cada índice ahora corresponde a las 3 dimensiones del vértice.
   get trianglesVertexCoords() {
      if (!this._trianglesVertexCoords.length) 
         this.calculateTrianglesVertexCoords();
      return this._trianglesVertexCoords;
   }

   // Obtiene la cantidad de triángulos del polígonos a partir de los índices generados
   // de cada triángulo en la triangulación. 3 índices <=> 1 triángulo.
   get trianglesCount() {
      return this.trianglesVertexIndices.length/3;
   }
}