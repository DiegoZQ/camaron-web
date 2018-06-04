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

PolygonMesh.prototype.getPolygons = function(){
  return this.polygons;
}

PolygonMesh.prototype.getPolygonsCount = function(){
  return this.polygonsCount;
}

PolygonMesh.prototype.getVertices = function(){
  return this.vertices;
}

PolygonMesh.prototype.getVerticesCount = function(){
  return this.verticesCount;
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