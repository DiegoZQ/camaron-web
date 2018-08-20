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
  return this.normal;
}

Vertex.prototype.calculateNormal = function(){
  this.normal = vec3.create();
  var polygon;
  var polygonNormal;
  var polygons = this.getPolygons();
  var polygonsCount = polygons.length;
  if(polygonsCount > 0){
    for(var i = 0; i < polygonsCount; i++){
      polygon = polygons[i];
      polygonNormal = polygon.getNormal();
      vec3.add(this.normal, this.normal, polygonNormal);
    }
    vec3.normalize(this.normal, this.normal);
  }
}

Vertex.prototype.getPolygons = function(){
  return this.polygons;
 }


var Polygon = function(id){
  Element.call(this, id);
  this.vertices = [];
  this.area = null;
  this.normal = null;
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

  return this.normal;
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

Polygon.prototype.getArea = function(){
  if(this.area == null){
    //TODO
    return 1;
  }
  return this.area;
}

Polygon.prototype.getAngles = function(){
  var sum = (this.vertices.length -2) * 180;
  var angles = []
  for(var i = 0; i<this.vertices.length; i++){
    var vertex1 = this.vertices[i];
    var vertex2 = this.vertices[(i+1)%this.vertices.length];
    var vertex3 = this.vertices[(i+2)%this.vertices.length];

    var vector1 = vec3.create();
    var vector2 = vec3.create();

    vec3.subtract(vector1, vertex1.getCoords(), vertex2.getCoords());
    vec3.subtract(vector2, vertex2.getCoords(), vertex3.getCoords());

    angles.push(Math.PI - vec3.angle(vector1, vector2));
  }
  return angles;
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
  this.lmax = vec3.idstance(this.vertices[1].getCoords(), this.vertices[2].getCoords());
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

Triangle.prototype.invertVerticesOrder = function(){
  var temp = this.vertices[0];
  this.vertices[0] = vertices[2];
  this.vertices[2] = temp;
  this.calculateNormal();
}