//PRIMITIVES

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
  this.coords = vec3.create();
  vec3.set(this.coords, x, y, z);
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


// MODELS
var Model = function(){
  this.bounds = [];
  this.modelType = null;
}

Model.prototype.getBounds = function(){
  return this.bounds;
}

Model.prototype.evaluate = function(evaluationStrategy){
  // TODO: implement
  return 1;
}


var PolygonMesh = function(polygonsCount, verticesCount){
  Model.call(this);
  this.modelType = 'PolygonMesh'
  this.polygonsCount = polygonsCount;
  this.verticesCount = verticesCount;
  this.polygons = [];
  this.vertices = [];

}

PolygonMesh.prototype = Object.create(Model.prototype);
PolygonMesh.prototype.constructor = PolygonMesh;

PolygonMesh.prototype.getPolygonsCount = function(){
  return this.polygonsCount;
}

PolygonMesh.prototype.getPolygons = function(){
  return this.polygons;
}

PolygonMesh.prototype.getVerticesCount = function(){
  return this.verticesCount;
}

PolygonMesh.prototype.getVertices = function(){
  return this.vertices;
}


var VertexCloud = function(verticesCount){
  Model.call(this);
  this.modelType = 'VertexCloud';
  this.verticesCount = verticesCount;
  this.vertices = null;
}

VertexCloud.prototype = Object.create(Model.prototype);
VertexCloud.prototype.constructor = VertexCloud;

VertexCloud.prototype.getVerticesCount = function(){
  return this.verticesCount;
}

VertexCloud.prototype.getVertices = function(){
  return this.vertices;
}


// RENDER MODEL
var RModel = function(model){
  this.originalModel = model;
  this.bounds = model.getBounds();
  this.center = vec3.fromValues((this.bounds[0]+this.bounds[3])/2, (this.bounds[1]+this.bounds[4])/2, (this.bounds[2]+this.bounds[5])/2);
  this.modelWidth = Math.abs(this.bounds[3] - this.bounds[0]);
  this.modelHeight = Math.abs(this.bounds[4] - this.bounds[1]);
  this.modelDepth = Math.abs(this.bounds[5] - this.bounds[2]);
  this.triangles = []; this.edges = []; this.vertices = [];
  this.trianglesNormals = []; this.verticesNormals = [];
  this.trianglesCount = 0; this.edgesCount = 0; this.verticesCount = 0;
  
  this.viewType = "perspective";
  this.aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;

  this.translation = vec3.fromValues(0, 0, 0);
  this.rotationMatrix = mat4.create();
  this.scale = vec3.fromValues(1, 1, 1);

  this.modelMatrix;
  this.viewMatrix;

  this.MV = mat4.create();
  this.MVP = mat4.create();

  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.loadData = function(){
  if(this.originalModel.modelType == "PolygonMesh"){
    this.loadDataFromPolygonMesh();
  }else if(this.originalModel.modelType == "VertexCloud"){
    this.loadDataFromVertexCloud();
  }
}

RModel.prototype.loadDataFromPolygonMesh = function(){
  var modelVerticesCount = this.originalModel.getVerticesCount;
  var modelVertices = this.originalModel.getVertices();
  var polygonsCount = model.getPolygonsCount();
  var polygons = model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  var polygonVertices;
  var normal;
  var vertex1; var vertexNormal1;
  var vertex2; var vertexNormal2;
  var vertex3; var vertexNormal3;
  
  for(var i = 0; i < polygonsCount; i++){
    polygon = polygons[i];
    normal = polygon.getNormal();
    polygonVerticesCount = polygon.getVerticesCount();
    polygonVertices = polygon.getVertices();
    for(var j = 1; j < polygonVerticesCount-1; j++){
      vertex1 = polygonVertices[0]; var vertexNormal1 = vertex1.getNormal();
      vertex2 = polygonVertices[j]; var vertexNormal2 = vertex2.getNormal();
      vertex3 = polygonVertices[j+1]; var vertexNormal3 = vertex3.getNormal();

      this.triangles.push(vertex1.getCoords()[0]); this.triangles.push(vertex1.getCoords()[1]); this.triangles.push(vertex1.getCoords()[2]);
      this.triangles.push(vertex2.getCoords()[0]); this.triangles.push(vertex2.getCoords()[1]); this.triangles.push(vertex2.getCoords()[2]);
      this.triangles.push(vertex3.getCoords()[0]); this.triangles.push(vertex3.getCoords()[1]); this.triangles.push(vertex3.getCoords()[2]);
      
      this.trianglesNormals.push(normal[0]);this.trianglesNormals.push(normal[1]);this.trianglesNormals.push(normal[2]);
      this.trianglesNormals.push(normal[0]);this.trianglesNormals.push(normal[1]);this.trianglesNormals.push(normal[2]);
      this.trianglesNormals.push(normal[0]);this.trianglesNormals.push(normal[1]);this.trianglesNormals.push(normal[2]);

      this.verticesNormals.push(vertexNormal1[0]);this.verticesNormals.push(vertexNormal1[1]);this.verticesNormals.push(vertexNormal1[2]);
      this.verticesNormals.push(vertexNormal2[0]);this.verticesNormals.push(vertexNormal2[1]);this.verticesNormals.push(vertexNormal2[2]);
      this.verticesNormals.push(vertexNormal3[0]);this.verticesNormals.push(vertexNormal3[1]);this.verticesNormals.push(vertexNormal3[2]);

      this.trianglesCount++;
    }

    for(var j = 0; j < polygonVerticesCount; j++){
      vertex1 = polygonVertices[j];
      if(j+1 == polygonVerticesCount){
        vertex2 = polygonVertices[0];
      }else{
        vertex2 = polygonVertices[j+1];
      }
      this.edges.push(vertex1.getCoords()[0]); this.edges.push(vertex1.getCoords()[1]); this.edges.push(vertex1.getCoords()[2]);
      this.edges.push(vertex2.getCoords()[0]); this.edges.push(vertex2.getCoords()[1]); this.edges.push(vertex2.getCoords()[2]);

      this.edgesCount++;
    }

    for(var k = 0; k < modelVerticesCount; k++){
      vertex1 = modelVertices[k];
      normal = vertex1.getNormal();

      this.vertices.push(vertex1.getCoords()[0]); this.vertices.push(vertex1.getCoords()[1]); this.vertices.push(vertex1.getCoords()[2]);
      
      this.verticesCount++;
    }
  }

  // Transform Arrays in Float32A Arrays
  this.triangles = new Float32Array(this.triangles);
  this.edges = new Float32Array(this.edges);
  this.vertices = new Float32Array(this.vertices);
  this.trianglesNormals = new Float32Array(this.trianglesNormals);
  this.verticesNormals = new Float32Array(this.verticesNormals);

  // Set Model Matrix
  var translation = vec3.fromValues(-this.center[0], -this.center[1], -this.center[2]);
  this.modelMatrix = mat4.create();
  mat4.translate(this.modelMatrix, this.modelMatrix, translation);

  // Set View Matrix
  var camera = vec3.fromValues(0, 0, this.modelDepth*2)
  var target = vec3.fromValues(0, 0, 0)
  var up = vec3.fromValues(0, 1, 0);
  this.viewMatrix = mat4.create()
  mat4.lookAt(this.viewMatrix, camera, target, up);  
}

RModel.prototype.loadDataFromVertexCloud = function(){

}

// Movement
RModel.prototype.setRotation = function(rotationMatrix){
  this.rotationMatrix = rotationMatrix;
  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.setTranslation = function(translationVector){
  var xFactor = this.modelWidth/500;
  var yFactor = this.modelHeight/500;

  this.translation[0] = translationVector[0] * xFactor;
  this.translation[1] = translationVector[1] * yFactor;


  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.setScale = function(scaleDelta){
  this.scale[0] += scaleDelta;
  this.scale[1] += scaleDelta;
  this.scale[2] += scaleDelta;
  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.reset = function(){
  this.translation = vec3.fromValues(0, 0, 0);
  this.rotationMatrix = mat4.create();
  this.scale = vec3.fromValues(1, 1, 1);
  this.updateAspect();
  this.recalculateMV = true;
  this.recalculateMVP = true;
}

// Matrix Getters
RModel.prototype.getMV = function(){
  if(this.recalculateMV){
    mat4.multiply(this.MV, this.viewMatrix, this.getModelMatrix());
    this.recalculateMV = false;
    this.recalculateMVP = true;
  }
  return this.MV;
}

RModel.prototype.getMVP = function(){
  if(this.recalculateMVP){
    mat4.multiply(this.MVP, this.getProjectionMatrix(), this.getMV())
    this.recalculateMVP = false
  }
  return this.MVP;
}

RModel.prototype.getModelMatrix = function(){
  var modelMatrix = mat4.create();
  var translation = vec3.fromValues(-this.center[0], -this.center[1], -this.center[2]);

  mat4.scale(modelMatrix, modelMatrix, this.scale);
  mat4.translate(modelMatrix, modelMatrix, this.translation);
  mat4.multiply(modelMatrix, modelMatrix, this.rotationMatrix);
  mat4.translate(modelMatrix, modelMatrix, translation);

  return modelMatrix;
}


RModel.prototype.getProjectionMatrix = function(){
  if(this.viewType == "ortho"){
    return this.getOrthoProjectionMatrix();
  }
  return this.getPerspectiveProjectionMatrix();
}

RModel.prototype.getOrthoProjectionMatrix = function(){
  var orthoProjectionMatrix = mat4.create();
  var width;
  var height;
  var margin = 1.5;
  if(gl.canvas.clientWidth < gl.canvas.clientHeight){
    width = this.modelWidth;
    height = this.modelWidth/this.aspect
  }else{
    width = this.modelHeight*this.aspect;
    height = this.modelHeight;
  }
  mat4.ortho(orthoProjectionMatrix, -(width/2)*margin, (width/2)*margin, -(height/2)*margin, (height/2)*margin, 1, this.modelDepth*50)
  
  return orthoProjectionMatrix;
}

RModel.prototype.getPerspectiveProjectionMatrix = function(){
  var perspectiveProjectionMatrix = mat4.create();
  var fieldOfViewRadians = degToRad(60);
  mat4.perspective(perspectiveProjectionMatrix, fieldOfViewRadians, this.aspect, 1, this.modelDepth*50);
  
  return perspectiveProjectionMatrix;
}

// Property Setters

RModel.prototype.setViewType = function(viewType){
  if(this.viewType != viewType){
    this.viewType = viewType;
    this.recalculateMV = true;
    this.recalculateMVP = true;
  }
}

// Property Getters

RModel.prototype.getColor = function(){
  return vec4.fromValues(0.7, 0.7, 0.7, 1);
}

RModel.prototype.updateAspect = function(){
  this.aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
}

RModel.prototype.getTriangles = function(){
  return this.triangles;
}

RModel.prototype.getEdges = function(){
  return this.edges;
}

RModel.prototype.getVertices = function(){
  return this.vertices;
}

RModel.prototype.getTrianglesNormals = function(){
  return this.trianglesNormals;
}

RModel.prototype.getVerticesNormals = function(){
  return this.verticesNormals;
}

RModel.prototype.getTrianglesCount = function(){
  return this.trianglesCount;
}

RModel.prototype.getEdgesCount = function(){
  return this.edgesCount;
}

RModel.prototype.getVerticesCount = function(){
  return this.verticesCount;
}
