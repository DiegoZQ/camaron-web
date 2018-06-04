// MODEL LOADING
var ModelLoadStrategy = function(){ }

ModelLoadStrategy.prototype.load = function(){
  return 1;
}

ModelLoadStrategy.prototype.validate = function(){
  return 0;
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

ModelLoadStrategy.prototype.calculatePolygonNormals = function(polygonMesh, threadCount){
  if(threadCount < 1) threadCount= 1;

  var worker;
  var polygonCount = polygonMesh.getPolygonsCount();
  var blockSize = polygonCount/threadCount;
  var from = 0; var to = blockSize;
  for(var i=0; i<threadCount; i++){
    if(i == threadCount-1) to = polygonCount;

    worker = new Worker('polygon-normal-worker.js')
      
    worker.postMessage([polygonMesh, from, to]);

    worker.onmessage = function(e){
      console.log(e.data);
    };

    from += blockSize;
    to += blockSize;
  }
}

ModelLoadStrategy.prototype.calculateVerticesNormals = function(polygonMesh, threadCount){
  if(threadCount < 1) threadCount= 1;

  var worker;
  var verticesCount = polygonMesh.getVerticesCount();
  var blockSize = verticesCount/threadCount;
  var from = 0; var to = blockSize;
  for(var i=0; i<threadCount; i++){
    if(i == threadCount-1) to = verticesCount;

    worker = new Worker('vertex-normal-worker.js')
      
    worker.postMessage([polygonMesh, from, to]);

    worker.onmessage = function(e){
      console.log(e.data);
    };

    from += blockSize;
    to += blockSize;
  }
}

ModelLoadStrategy.prototype.completeMesh = function(polygonMesh){
  this.completeVertexPolygonsRelations(polygonMesh);
  this.calculatePolygonNormals(polygonMesh);
  this.calculateVerticesNormals(polygonMesh);
}