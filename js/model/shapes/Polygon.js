"use strict";

// requires './Shape';
// requires '../external/gl-matrix';
// requires "../external/earcut";



class Polygon extends Shape {
   constructor(id) {
      super(id);
      this.vertices = [];
      this._angles = [];
      this._isConvex = null;
      this._basisVectors = null;
      this._normal = null;
      this._vertices2D = [];
      this._trianglesVertexIndices = [];
      this._trianglesVertexCoords = [];
      this._area = null;
      this._geometricCenter = null;
      this.neighbours = [];
      this.holes = [];
      this.isVisible = true;
      this._minAngle = null;
      this._aspectRatio = null;
   }

   // Obtiene los ángulos internos del polígono.
   get angles() {
      // Si todavía no lo ha calculado, obtiene los ángulos calculando las direcciones de giro entre los lados del polígono. 
      // Si este es convexo, sólo tendrá una dirección de giro; si es no convexo, tendrá una dirección de giro mayoritaria y una minoritaria.
      // La fórmula del ángulo por arista es:
      //    vec3.angle(vector2, vector1) si el polígono es convexo o la dirección de giro es mayoritaria.
      //    2*Math.PI - vec3.angle(vector2, vector1) si el polígono es no convexo y la dirección de giro es minoritaria.
      // donde vector 1 corresponde al vector que va del vértice anterior al actual y vector2 corresponde al vector que va desde el vértice actual al siguiente.
      if (!this._angles.length) {
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
         const orientation = normals.map(normal => sameDirection(firstNormal, normal) ? true : false);
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
      return this._angles;
   }
   // Asigna un valor al campo _angles.
   set angles(value) {
      this._angles = value;
   }  

   // Obtiene true si el polígono es convexo y false si es no convexo.
   get isConvex() {
      // Si todavía no lo ha calculado, verifica si tiene un ángulo mayor 180 grados. Si no lo tiene es convexo; en otro caso es no convexo.
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
   // Asigna un valor booleno al campo _isConvex.
   set isConvex(value) {
      this._isConvex = value;
   }

   // Obtiene los vectores base que definen el plano donde se encuentra el polígono.
   get basisVectors() {
      if (this._basisVectors == null) {
         try {
            const [u, v, vertexIndex] = findBasisVectorsFromVertices(this.vertices);
            // si los vectores base u, v encontrados, fueron sobre un vértice que comprende un ángulo de +180 grados,
            // se invierte la dirección de uno de los vectores base ya que el producto cruz de dichos vectores va en la dirección
            // MINORITARIA, la cual NO es representativa para determinar la orientación real del polígono.
            if (this.angles && this.angles[vertexIndex] > Math.PI) {
               vec3.negate(v, v);
            }
            vec3.normalize(u, u);
            vec3.normalize(v, v);
            this._basisVectors = {u: u, v: v};
            //this._basisVectors = {u: [1,0,0], v: [0,1,0]};
            
         } catch {
            console.log(this.vertices, this.id);
            console.error('Could not find basis vectors. All vertices are collinear')
         }
      }
      return this._basisVectors;
   }

   // Obtiene la normal del polígono.
   get normal() {
      // Si todavía no la ha calculado, obtiene la normal del plano utilizando los vectores base qu lo define. 
      // Se asume que el polígono es planar, ie, todos sus vértices se ubican en un mismo plano.
      if (this._normal == null) {
         this._normal = vec3.create();
         const { u, v } = this.basisVectors;
         vec3.cross(this._normal, u, v);
         vec3.normalize(this._normal, this._normal);
      }
      return vec3.clone(this._normal);
   }
   
   // Obtiene una lista con los vértices del polígono mapeados a 2 dimensiones.
   get vertices2D() {
      if (!this._vertices2D.length || this._vertices2D.length/2 != this.vertices.length) {
         const points3D = []
         const { u, v } = this.basisVectors;
         for (const i in this.vertices) {
            points3D.push(...this.vertices[i].coords);
         }
         this._vertices2D = mapTo2D(points3D, u, v);
      }
      return this._vertices2D;
   }

   // Obtiene los índices de los vértices de cada triángulo perteneciente a la triangulación del polígono.
   get trianglesVertexIndices() { 
      // Si todavía no lo ha calculado, obtiene los índices de los vértices de cada triángulo del polígono, cada 3 índices corresponde a un triángulo.
      // Para hacer esto, aplica una triangulación al polígono dependiendo de si es convexo o no convexo según corresponda.
      if (!this._trianglesVertexIndices.length) {
         const vertices = this.vertices;
         // Caso 1: triángulo, no requiere triangulación
         if (vertices.length === 3) {
            this._trianglesVertexIndices = [0,1,2];
         }
         // Caso 2: polígono convexo
         else if (this.isConvex) {
            for (let i = 1; i < vertices.length - 1; i++) {
               const triangle = [0, i, i+1];
               this._trianglesVertexIndices.push(...triangle);
           }
         }  
         // Caso 3: polígono no convexo
         else {
            this._trianglesVertexIndices = earcut(this.vertices2D, this.holes.length ? this.holes : null);
         }
      }
      return this._trianglesVertexIndices;
   }
   // Asigna un valor para el campo _trianglesVertexIndices.
   set trianglesVertexIndices(value) {
      this._trianglesVertexIndices = value;
   }

   // Obtiene la cantidad de triángulos del polígonos a partir de los índices generados
   // de cada triángulo en la triangulación. 3 índices <=> 1 triángulo.
   get trianglesCount() {
      return this.trianglesVertexIndices.length/3;
   }

   // Similar a getTriangleVertexIndices, sólo que cada índice ahora corresponde a las 3 dimensiones del vértice.
   get trianglesVertexCoords() {
      if (!this._trianglesVertexCoords.length) {
         const vertices = this.vertices;
         const trianglesVertexIndices = this.trianglesVertexIndices;
         const orderedVertexCoords = [];
         for (const vertexIndex of trianglesVertexIndices) {
            orderedVertexCoords.push(...vertices[vertexIndex].coords);
         }
         this._trianglesVertexCoords = orderedVertexCoords;
      }
      return this._trianglesVertexCoords;
   }

   // Obtiene el área del polígono.
   get area() {
      // Si todavía no la ha calculado, obtiene el área del polígono asumiendo que es planar. 
      // Al hacerlo, también calcula la normal del polígono, que a su vez se obtiene luego de haber
      // calculado la tringulación del polígono.
      if (this._area == null) {
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
      return this._area;
   }
   // Asigna un valor para el área del polígono.
   set area(value) {
      this._area = value;
   }

   // Obtiene el centro geométrico del polígono.
   get geometricCenter() {
      // Si todavía no lo ha calculado, obtiene las coordenadas de todos los vértices del polígono y las promedia.
      if (this._geometricCenter == null) {
         const vertices = this.vertices;
         this._geometricCenter = vec3.create();
         // Suma todos los vértices del polígono y los promedia.
         for (const vertex of vertices) 
            vec3.add(this._geometricCenter, this._geometricCenter, vertex.coords);
         vec3.scale(this._geometricCenter, this._geometricCenter, 1 / vertices.length);
      }
      return vec3.clone(this._geometricCenter);
   } 
   // Asigna un valor para el centro geométrico del polígono.
   set geometricCenter(value) {
      this._geometricCenter = value;
   }

   isNeighbour(polygon) {
      return this.neighbours.includes(polygon);
   }

   // Verifica si un punto está dentro del polígono mediante el ray-casting algorithm. Retorna true si está dentro y false si no.
   pointInPolygon(point) {
      return pointToPolygonDist(point, this) >= 0;
   }
  
   // Verifica si un polígono está contenido en el polígono validando que todos sus vértices estén dentro del polígono; retorna true
   // si la condición se cumple, false si no.
   polygonInPolygon(polygon) {
      for (const vertex of polygon.vertices) {
         if (!this.pointInPolygon(vertex.coords)) {
            return false;
         }
      }
      return true;
   }

   // Agrega un polígono más pequeño como agujero del polígono.
   addPolygonAsHole(smallPolygon) {
      const polygonVerticesLength = this.vertices.length;
      // Calcula el nuevo centro geométrico
      const polygonGC = this.geometricCenter;
      vec3.scale(polygonGC, polygonGC, this.area);
      vec3.scaleAndAdd(polygonGC, polygonGC, smallPolygon.geometricCenter, -smallPolygon.area); 
      vec3.scale(polygonGC, polygonGC, 1/(this.area - smallPolygon.area));
      this.geometricCenter = polygonGC;
      // Agrega los nuevos vértices
      this.vertices.push(...smallPolygon.vertices);
      // Agrega los nuevos ángulos invirtiendo sus ángulos
      this.angles.push(...smallPolygon.angles.map(angle => 2*Math.PI - angle));
      // Automáticamente se vuelve no convexo
      this.isConvex = false;
      // Y se elimina la triangulación para dar paso a una nueva
      this.trianglesVertexIndices = [];
      // Se resta el área del polígono
      this.area = this.area - smallPolygon.area;
      // Y se agrega como agujero a partir del último vértice del polígono inicial
      this.holes.push(polygonVerticesLength);
   }

   get minAngle() {
      if (this._minAngle == null) {
         const angles = this.angles;
         this._minAngle = Math.min(...angles);
      }
      return this._minAngle;
   }

   // Obtiene el aspect ratio del polígono, el cual corresponde al cociente entre el inradio y el circunradio del polígono.
   get aspectRatio() {
      if (this._aspectRatio == null) {
         const circumradius = getPolygonCircumradius(this);
         this._aspectRatio = circumradius ? getPolygonInradius(this, 1.0) / circumradius : 0;
      }
      return this._aspectRatio;
   }
}