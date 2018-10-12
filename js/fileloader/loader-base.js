"use strict";

// MODEL LOADING
var ModelLoadStrategy = function(){ }

ModelLoadStrategy.prototype.load = function(){
  return 1;
}

ModelLoadStrategy.prototype.isValid = function(){
  return false
}

ModelLoadStrategy.prototype.calculateVertexNormals = function(polygonMesh){
  var vertices = polygonMesh.getVertices();
  for(var i in vertices){
    vertices[i].calculateNormal();
  }
}

ModelLoadStrategy.prototype.completeMesh = function(polygonMesh){
  //this.calculateVertexNormals(polygonMesh);
}