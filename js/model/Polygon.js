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
      vec3.subtract(U, vertices[trianglesVertexIndices[1]].coords, vertices[trianglesVertexIndices[0]].coords); 
      vec3.subtract(V, vertices[trianglesVertexIndices[2]].coords, vertices[trianglesVertexIndices[0]].coords);
      vec3.cross(this._normal, U, V);
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

   // este mamawebo tiene el problema con el earcut y la conversión 3 coords a 2 coords 
   // la idea sería aplicar la triangulación que usaba el men del camarón web original para los convexos 
   // y para los no convexos realizar el ear_cut considerando solo 2 coordenadas x,y. Voy a asumir que
   // en el caso de presentarse polígonos no convexos, estos estarán sí o sí en un "plano" 2 dimensión,
   // aunque no sé si ese plano siempre será xy o pueden haber planos inclinados megalol
   calculateTrianglesVertexIndices() {
      const vertices = this.vertices;
      const vertexCoords = new Float32Array(2*vertices.length);
      for (let i = 0; i < vertices.length; i++) {
         const coords = vertices[i].coords;
         console.log('init coords', coords);
         const j = i*2;
         const scale = 100.0 / (100.0 + coords[2]);
         vertexCoords[j] = (coords[0] + 1) * scale;
         vertexCoords[j+1] = (coords[1] + 1) * scale;         

         console.log('final coords', vertexCoords[j], vertexCoords[j+1]);
      }
      this._trianglesVertexIndices = earcut(vertexCoords, null);
      if (this.id == 3) {
         console.log('NOOOO', this._trianglesVertexIndices, vertexCoords);
      }

      for (let i = 0; i < this._trianglesVertexIndices.length; i += 3) {
         const group = this._trianglesVertexIndices.slice(i, i + 3);
         group.sort((a, b) => a - b); // Sort the group in ascending order
         this._trianglesVertexIndices.splice(i, 3, ...group);
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