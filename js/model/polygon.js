import Element from './element';
import { vec3 } from '../external/gl-matrix';


class Polygon extends Element {
   constructor(id) {
      super(id);
      this.vertices = [];
      this.angles = null;
      this.area = null;
      this.normal = null;
      this.geometricCenter = null;
      this.neighbours = [];
   }

   getVertices() {
      return this.vertices;
   }

   getVerticesCount() {
      return this.getVertices().length;
   }

   // Asume que el polígono es planar, ie, todos sus vértices se ubican en un mismo plano.
   calculateNormal() {
      this.normal = vec3.create();
      const U = vec3.create();
      const V = vec3.create();
      const vertices = this.getVertices();
      // Calcula el plano a partir de los vectores U, V que conforman un triángulo cualquiera del plano.
      // Como es planar, dicho plano es compartido por todos los demás triángulos.
      vec3.subtract(U, vertices[1].getCoords(), vertices[0].getCoords());
      vec3.subtract(V, vertices[2].getCoords(), vertices[0].getCoords());
      vec3.cross(this.normal, U, V);
      vec3.normalize(this.normal, this.normal);
   }

   getNormal() {
      if (this.normal === null) 
         this.calculateNormal();
      return vec3.clone(this.normal);
   }

   // Calcula el centro geométrico del polígono, para posteriormente asignarle una normal.
   calculateGeometricCenter() {
      const vertices = this.getVertices();
      this.geometricCenter = vec3.create();
      // Suma todos los vértices del polígono y los promedia.
      for (const vertex of vertices) 
         vec3.add(this.geometricCenter, this.geometricCenter, vertex.getCoords());
      vec3.scale(this.geometricCenter, this.geometricCenter, 1 / vertices.length);
   }

   getGeometricCenter() {
      if (this.geometricCenter === null) 
         this.calculateGeometricCenter();
      return vec3.clone(this.geometricCenter);
   }

   // Calcula el área de un polígono planar.
   calculateArea() {
      const total = vec3.create();
      const vertices = this.getVertices();
      for (const i in vertices) {
         const v1 = vertices[i].getCoords();
         const v2 = vertices[(i + 1) % vertices.length].getCoords();
         const prod = vec3.create();
         vec3.cross(prod, v1, v2);
         vec3.add(total, total, prod);
      }
      const result = vec3.dot(total, this.getNormal());
      this.area = Math.abs(result / 2);
   }

   getArea() {
      if (this.area === null) 
         this.calculateArea();
      return this.area;
   }

   calculateAngles() {
      const vertices = this.getVertices();
      this.angles = new Array(vertices.length);
      for (const i in vertices) {
         const vertex1 = vertices[i].getCoords();
         const vertex2 = vertices[(i + 1) % vertices.length].getCoords();
         const vertex3 = vertices[(i + 2) % vertices.length].getCoords();
         const vector1 = vec3.create();
         const vector2 = vec3.create();
         vec3.subtract(vector1, vertex1, vertex2);
         vec3.subtract(vector2, vertex2, vertex3);
         this.angles[i] = Math.PI - vec3.angle(vector1, vector2);
      }
   }

   getAngles() {
      if (this.angles == null) 
         this.calculateAngles();
      return this.angles;
   }

   isNeighbour(polygon) {
      return this.neighbours.includes(polygon);
   }
}

export default Polygon;