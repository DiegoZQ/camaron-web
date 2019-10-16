"use strict";

var Element = function(id){
  this.id = id;
  this.selected = false;
}

Element.prototype.getId = function(){
  return this.id;
}

Element.prototype.isSelected = function(){
  return this.selected;
}

Element.prototype.setSelected = function(s){
  this.selected = s;
}


var Vertex = function(id, x, y, z){
  Element.call(this, id);
  this.coords = vec3.fromValues(x, y, z);
  this.normal = null;
  this.polygons = [];
}

Vertex.prototype = Object.create(Element.prototype);
Vertex.prototype.constructor = Vertex;

Vertex.prototype.getCoords = function(){
  return this.coords;
}

Vertex.prototype.getNormal = function(){
  if(this.normal == null){
    this.calculateNormal()
  }
  var n = vec3.clone(this.normal)
  return n;
}

Vertex.prototype.getPolygons = function(){
  return this.polygons;
}

Vertex.prototype.calculateNormal = function(){
  this.normal = vec3.create();
  if(this.polygons.length > 0){
    for(var i = 0; i < this.polygons.length; i++){
      vec3.add(this.normal, this.normal, this.polygons[i].getNormal());
    }
    vec3.normalize(this.normal, this.normal);
  }
}

var Polygon = function(id){
  Element.call(this, id);
  this.vertices = [];
  this.angles = null;
  this.area = null;
  this.normal = null;
  this.geometricCenter = null;
  this.neighbours = [];
}

Polygon.prototype = Object.create(Element.prototype);
Polygon.prototype.constructor  = Polygon;

Polygon.prototype.getVerticesCount = function(){
  return this.vertices.length;
}

Polygon.prototype.getVertices = function(){
  return this.vertices;
}

Polygon.prototype.getNormal = function(){
  if(this.normal == null){
    this.calculateNormal();
  }
  var n = vec3.clone(this.normal);
  return n;
}

Polygon.prototype.getGeometricCenter = function(){
  if(this.geometricCenter == null){
    this.calculateGeometricCenter();
  }
  return this.geometricCenter;
}

Polygon.prototype.getArea = function(){
  if(this.area == null){
    this.calculateArea();
  }
  return this.area;
}

Polygon.prototype.getAngles = function(){
  if(this.angles == null){
    this.calculateAngles();
  }
  return this.angles;
}

Polygon.prototype.calculateNormal = function(){
  this.normal = vec3.create();
  var U = vec3.create();
  var V = vec3.create();
  vec3.subtract(U, this.vertices[1].getCoords(), this.vertices[0].getCoords());
  vec3.subtract(V, this.vertices[2].getCoords(), this.vertices[0].getCoords());
  vec3.cross(this.normal, U, V);
  vec3.normalize(this.normal, this.normal);  
}

Polygon.prototype.calculateGeometricCenter = function(){
  this.geometricCenter = vec3.create();
  for(var i=0; i< this.vertices.length; i++){
    vec3.add(this.geometricCenter, this.geometricCenter, this.vertices[i].getCoords());
  }
  this.geometricCenter[0] = this.geometricCenter[0]/this.vertices.length;
  this.geometricCenter[1] = this.geometricCenter[1]/this.vertices.length;
  this.geometricCenter[2] = this.geometricCenter[2]/this.vertices.length;
}

Polygon.prototype.calculateArea = function(){
  var total = vec3.create();
  var result; var v1; var v2;
  for(var i=0; i < this.vertices.length; i++){
    v1 = this.vertices[i].getCoords();
    if(i == this.vertices.length-1){
      v2 = this.vertices[0].getCoords();
    }else{
      v2 = this.vertices[i+1].getCoords();
    }
    var prod = vec3.create();
    vec3.cross(prod, v1, v2);

    vec3.add(total, total, prod)
  }
  var aux = vec3.create();
  result = vec3.dot(total, this.getNormal());
  this.area = Math.abs(result/2);
}

Polygon.prototype.calculateAngles = function(){
  this.angles = new Array(this.vertices.length);
  var sum = (this.vertices.length -2) * 180;
  for(var i = 0; i<this.vertices.length; i++){
    var vertex1 = this.vertices[i].getCoords();
    var vertex2 = this.vertices[(i+1)%this.vertices.length].getCoords();
    var vertex3 = this.vertices[(i+2)%this.vertices.length].getCoords();

    var vector1 = vec3.create();
    var vector2 = vec3.create();

    vec3.subtract(vector1, vertex1, vertex2);
    vec3.subtract(vector2, vertex2, vertex3);

    this.angles[i] = Math.PI - vec3.angle(vector1, vector2);
  }
}


Polygon.prototype.isNeighbour = function(polygon){
  return neighbours.includes(polygon);
}


var Triangle = function(id){
  Polygon.call(this, id);
  this.lmin = null;
  this.lmid = null;
  this.lmax = null;
}

Triangle.prototype = Object.create(Polygon.prototype);
Triangle.prototype.constructor = Triangle;

Triangle.prototype.getArea = function(){
  if(this.area == null){
    var a = this.getLMax();
    var b = this.getLMid();
    var c = this.getLMin();
    var p = (a+b+c)/2;
    this.area = Math.sqrt(p*(p-a)*(p-b)+(p-c));
  }
  return this.area;
}

Triangle.prototype.getLMin = function(){
  if(this.lmin == null){
    this.setSides();
  }
  return this.lmin;
}

Triangle.prototype.getLMid = function(){
  if(this.lmid == null){
    this.setSides();
  }
  return this.lmid;
}

Triangle.prototype.getLMax = function(){
  if(this.lmax == null){
    this.setSides();
  }
  return this.lmax;
}

Triangle.prototype.setSides = function(){
  var aux;
  this.lmin = vec3.distance(this.vertices[0].getCoords(), this.vertices[1].getCoords());
  this.lmid = vec3.distance(this.vertices[0].getCoords(), this.vertices[2].getCoords());
  this.lmax = vec3.distance(this.vertices[1].getCoords(), this.vertices[2].getCoords());
  if(this.lmid < this.lmin){
    aux = this.lmid;
    this.lmid = this.lmin;
    this.lmin = aux;
  }

  if(this.lmax < this.lmid){
    aux = this.lmax;
    this.lmax = this.lmid;
    this.lmid = aux;
  }

  if(this.lmid < this.lmin){
    aux = this.lmid;
    this.lmid = this.lmin;
    this.lmin = aux;
  }
}
