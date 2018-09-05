// MODEL LOADING
var ModelLoadStrategy = function(){ }

ModelLoadStrategy.prototype.load = function(){
  return 1;
}

ModelLoadStrategy.prototype.isValid = function(){
  return false
}

ModelLoadStrategy.prototype.completeVertexPolygonsRelations = function(polygonMesh){
  var polygons = polygonMesh.getPolygons();
  for(var i in polygons){
    vertices = polygons[i].getVertices();
    for(var j in vertices){
      vertices[j].getPolygons().push(polygons[i]);
    }
  }
}

ModelLoadStrategy.prototype.completeMesh = function(polygonMesh){
  this.completeVertexPolygonsRelations(polygonMesh);
}