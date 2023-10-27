"use strict";

class Model {
  constructor() {
    this.bounds = [];
    this.modelType = null;
  }

  getBounds() {
    return this.bounds;
  }
}




var Model = function(){
  this.bounds = [];
  this.modelType = null;
}

Model.prototype.getBounds = function(){
  return this.bounds;
}

var PolygonMesh = function(polygonsCount, verticesCount){
  Model.call(this);
  this.modelType = 'PolygonMesh'
  this.polygonsCount = polygonsCount;
  this.verticesCount = verticesCount;
  this.polygons = new Array(this.polygonsCount);
  this.vertices = new Array(this.verticesCount);

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
