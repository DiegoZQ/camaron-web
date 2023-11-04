// requires './Shape';
// requires '../external/gl-matrix';
// requires "../external/earcut";


class Polygon extends Shape {
   constructor(id) {
      super(id);
      this.vertices = [];
      this._angles = null;
      this._area = null;
      this._normal = null;
      this._geometricCenter = null;
      this.neighbours = [];
      this._trianglesVertexIndices = [];
      this._trianglesVertexCoords = [];
   }

   // Asume que el polígono es planar, ie, todos sus vértices se ubican en un mismo plano.
   calculateNormal() {
      this._normal = vec3.create();
      const U = vec3.create();
      const V = vec3.create();
      const vertices = this.vertices;
      const trianglesVertexIndices = this.trianglesVertexIndices;
      // Calcula el plano a partir de los vectores U, V que conforman un triángulo cualquiera del plano.
      // Como es planar, dicho plano es compartido por todos los demás triángulos.
      vec3.subtract(U, vertices[trianglesVertexIndices[1]].coords, vertices[trianglesVertexIndices[0]].coords); // 1 2 0 good    1   2 1 0
      vec3.subtract(V, vertices[trianglesVertexIndices[2]].coords, vertices[trianglesVertexIndices[0]].coords); // 1 0 2 malardo  #  2 1 0  120  201   0 1 2     3  1  2     4 1 2 
      vec3.cross(this._normal, U, V);
      vec3.normalize(this._normal, this._normal);

      let inverse = false;
      if (trianglesVertexIndices[2] - trianglesVertexIndices[0] > 0) {
         if (trianglesVertexIndices[0] > trianglesVertexIndices[1] || trianglesVertexIndices[1] > trianglesVertexIndices[2])
            inverse = true;
      }

      if (inverse) {
         vec3.negate(this._normal, this._normal);
         console.log(trianglesVertexIndices[0], trianglesVertexIndices[1], trianglesVertexIndices[2]);

      }
      
      //if (!((trianglesVertexIndices[0] < trianglesVertexIndices[1] && trianglesVertexIndices[1] < trianglesVertexIndices[2]) ||  
      //    (trianglesVertexIndices[0] > trianglesVertexIndices[1] && trianglesVertexIndices[1] > trianglesVertexIndices[2]))) {
      //      vec3.negate(this._normal, this._normal);
      //      console.log(trianglesVertexIndices[0], trianglesVertexIndices[1], trianglesVertexIndices[2]);
      //    }
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

   calculateAngles() {
      const vertices = this.vertices;
      this._angles = new Array(vertices.length);
      for (let i = 0; i < vertices.length; i++) {
         const vertex1 = vertices[i].coords;
         const vertex2 = vertices[(i + 1) % vertices.length].coords;
         const vertex3 = vertices[(i + 2) % vertices.length].coords;
         const vector1 = vec3.create();
         const vector2 = vec3.create();
         vec3.subtract(vector1, vertex1, vertex2);
         vec3.subtract(vector2, vertex2, vertex3);
         this._angles[i] = Math.PI - vec3.angle(vector1, vector2);
      }
   }

   get angles() {
      if (this._angles == null) 
         this.calculateAngles();
      return this._angles;
   }

   isNeighbour(polygon) {
      return this.neighbours.includes(polygon);
   }

   calculateTrianglesVertexIndices() {
      const vertices = this.vertices;
      const vertexCoords = new Float32Array(2*vertices.length);
      for (let i = 0; i < vertices.length; i++) {
         const coords = vertices[i].coords;
         const j = i*2;
         const scale = 100.0 / (100.0 + coords[2]);
         vertexCoords[j] = coords[0] * scale;
         vertexCoords[j+1] = coords[1] * scale;
      }
      this._trianglesVertexIndices = earcut(vertexCoords, null);
      //if (tulepera[1] == 2 && tulepera[2] != 0)
         //console.log(tulepera);

      //if (Math.random() <= 0.5)
      //   this._trianglesVertexIndices = [1,0,2];
      //else
      //   this._trianglesVertexIndices = [2,1,0];


   
      return;
      //this._trianglesVertexIndices = earcut(vertexCoords, null);
      //console.log('tulapera', we);

      //   const j = i*3;
      //   vertexCoords[j] = coords[0];
      //   vertexCoords[j+1] = coords[1];
      //   vertexCoords[j+2] = coords[2];
      //}
      //this._trianglesVertexIndices = earcut(vertexCoords, null, 3);

      //const vertices = this.vertices;
      //const vertexCoords = new Float32Array(3*vertices.length);
      //for (let i = 0; i < vertices.length; i++) {
      //   const coords = vertices[i].coords;
      //   const j = i*3;
      //   vertexCoords[j] = coords[0];
      //   vertexCoords[j+1] = coords[1];
      //   vertexCoords[j+2] = coords[2];
      //}
      //this._trianglesVertexIndices = earcut(vertexCoords, null, 3);
      this._trianglesVertexIndices = [1,0,2]; // 0 1 2
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