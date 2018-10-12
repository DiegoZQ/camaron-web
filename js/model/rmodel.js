"use strict";

var RModel = function(){

  // Model Size data
  this.bounds = model.getBounds();
  this.center = vec3.fromValues((this.bounds[0]+this.bounds[3])/2, (this.bounds[1]+this.bounds[4])/2, (this.bounds[2]+this.bounds[5])/2);
  this.modelWidth = Math.abs(this.bounds[3] - this.bounds[0]);
  this.modelHeight = Math.abs(this.bounds[4] - this.bounds[1]);
  this.modelDepth = Math.abs(this.bounds[5] - this.bounds[2]);
  
  // Buffers
  this.trianglesBuffer = gl.createBuffer(); this.edgesBuffer = gl.createBuffer(); this.verticesBuffer = gl.createBuffer();
  this.trianglesNormalsBuffer = gl.createBuffer(); this.verticesNormalsBuffer = gl.createBuffer();
  this.faceNormalsLinesBuffer = gl.createBuffer(); this.vertexNormalsLinesBuffer = gl.createBuffer();
  
  // Element Quantities
  this.polygonsCount = model.getPolygonsCount();
  this.verticesCount = model.getVerticesCount();
  this.trianglesCount = 0; this.edgesCount = 0; 
  
  // Configuration
  this.loaded = 0;
  this.viewType = "perspective";
  this.aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;

  // Movement Vectors/Matrices
  this.translation = vec3.fromValues(0, 0, 0);
  this.rotationMatrix = mat4.create();
  this.scale = vec3.fromValues(1, 1, 1);


  // CG Matrices
  this.modelMatrix;
  this.viewMatrix;

  this.MV = mat4.create();
  this.MVP = mat4.create();

  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.loadData = function(){
  if(model.modelType == "PolygonMesh"){
    this.loadDataFromPolygonMesh();
  }
}

RModel.prototype.loadDataFromPolygonMesh = function(){
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

RModel.prototype.loadTriangles = function(){
  var polygons = model.getPolygons();

  var polygon; var polygonVerticesCount; var polygonVertices;
  var vertex1; var vertex2; var vertex3;

  for(var i = 0; i < this.polygonsCount; i++){
    polygonVerticesCount = polygons[i].getVerticesCount();
    for(var j = 1; j < polygonVerticesCount-1; j++){
      this.trianglesCount++;
    }
  }

  var triangles = new Float32Array(this.trianglesCount*9);
  var tcount = 0;

  for(var i = 0; i < this.polygonsCount; i++){
    polygon = polygons[i];
    polygonVerticesCount = polygon.getVerticesCount();
    polygonVertices = polygon.getVertices();
    for(var j = 1; j < polygonVerticesCount-1; j++){
      vertex1 = polygonVertices[0].getCoords();
      vertex2 = polygonVertices[j].getCoords();
      vertex3 = polygonVertices[j+1].getCoords();

      triangles[tcount] = vertex1[0]; triangles[tcount+1] = vertex1[1]; triangles[tcount+2] = vertex1[2];
      triangles[tcount+3] = vertex2[0]; triangles[tcount+4] = vertex2[1]; triangles[tcount+5] = vertex2[2];
      triangles[tcount+6] = vertex3[0]; triangles[tcount+7] = vertex3[1]; triangles[tcount+8] = vertex3[2];

      tcount += 9;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
  this.loaded += 1;
}

RModel.prototype.loadTrianglesNormals = function(){
  var polygons = model.getPolygons();

  var polygon; var polygonVerticesCount; var polygonVertices;
  var normal;

  var trianglesNormals = new Float32Array(this.trianglesCount*9);
  var tcount = 0;

  for(var i = 0; i < this.polygonsCount; i++){
    polygon = polygons[i];
    normal = polygon.getNormal();
    polygonVerticesCount = polygon.getVerticesCount();
    polygonVertices = polygon.getVertices();
    for(var j = 1; j < polygonVerticesCount-1; j++){      
      trianglesNormals[tcount] = normal[0]; trianglesNormals[tcount+1] = normal[1]; trianglesNormals[tcount+2] = normal[2];
      trianglesNormals[tcount+3] = normal[0]; trianglesNormals[tcount+4] = normal[1]; trianglesNormals[tcount+5] = normal[2];
      trianglesNormals[tcount+6] = normal[0]; trianglesNormals[tcount+7] = normal[1]; trianglesNormals[tcount+8] = normal[2];

      tcount += 9;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, trianglesNormals, gl.STATIC_DRAW);
  this.loaded += 1;
}

RModel.prototype.loadVertexNormals = function(){
  var polygons = model.getPolygons();

  var polygon; var polygonVerticesCount; var polygonVertices;
  var vertexNormal1; var vertexNormal2; var vertexNormal3;

  var verticesNormals = new Float32Array(this.trianglesCount*9);
  var tcount = 0;

  for(var i = 0; i < this.polygonsCount; i++){
    polygon = polygons[i];
    polygonVerticesCount = polygon.getVerticesCount();
    polygonVertices = polygon.getVertices();
    for(var j = 1; j < polygonVerticesCount-1; j++){
      vertexNormal1 = polygonVertices[0].getNormal();
      vertexNormal2 = polygonVertices[j].getNormal();
      vertexNormal3 = polygonVertices[j+1].getNormal();
      
      verticesNormals[tcount] = vertexNormal1[0]; verticesNormals[tcount+1] = vertexNormal1[1]; verticesNormals[tcount+2] = vertexNormal1[2];
      verticesNormals[tcount+3] = vertexNormal2[0]; verticesNormals[tcount+4] = vertexNormal2[1]; verticesNormals[tcount+5] = vertexNormal2[2];
      verticesNormals[tcount+6] = vertexNormal3[0]; verticesNormals[tcount+7] = vertexNormal3[1]; verticesNormals[tcount+8] = vertexNormal3[2];

      tcount += 9;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesNormals, gl.STATIC_DRAW);
  this.loaded += 1;
}

RModel.prototype.loadEdges = function(){
  var polygons = model.getPolygons();

  var polygon; var polygonVerticesCount; var polygonVertices;
  var vertex1; var vertex2;

  for(var i = 0; i < this.polygonsCount; i++){
    polygonVerticesCount = polygons[i].getVerticesCount();
    for(var j = 0; j < polygonVerticesCount; j++){
      this.edgesCount++;
    }
  }

  var edges = new Float32Array(this.edgesCount*6);
  var ecount = 0;

  for(var i = 0; i < this.polygonsCount; i++){
    polygon = polygons[i];
    polygonVerticesCount = polygon.getVerticesCount();
    polygonVertices = polygon.getVertices();
 

    for(var j = 0; j < polygonVerticesCount; j++){
      vertex1 = polygonVertices[j].getCoords();
      if(j+1 == polygonVerticesCount){
        vertex2 = polygonVertices[0].getCoords();
      }else{
        vertex2 = polygonVertices[j+1].getCoords();
      }

      edges[ecount] = vertex1[0]; edges[ecount+1] = vertex1[1]; edges[ecount+2] = vertex1[2];
      edges[ecount+3] = vertex2[0]; edges[ecount+4] = vertex2[1]; edges[ecount+5] = vertex2[2];

      ecount += 6;
    }
  }
    
  // Add data to buffer on GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, this.edgesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);
  this.loaded += 1;
}

RModel.prototype.loadVertices = function(){
  var modelVertices = model.getVertices();

  var normal; var vertex1;

  var vertices = new Float32Array(this.verticesCount*3);
  var vcount = 0;

  for(var k = 0; k < this.verticesCount; k++){
    vertex1 = modelVertices[k].getCoords();
    normal = modelVertices[k].getNormal();

    vertices[vcount] = vertex1[0]; vertices[vcount+1] = vertex1[1]; vertices[vcount+2] = vertex1[2];
    
    vcount += 3;
  }

  // Add data to buffer on GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  this.loaded += 1;
}

RModel.prototype.loadVertexNormalsLines = function(){
  var modelVertices = model.getVertices();

  var normal;  var vertex1;

  var vertexNormalsLines = new Float32Array(this.verticesCount*6);
  var vncount = 0;

  for(var k = 0; k < this.verticesCount; k++){
    vertex1 = modelVertices[k].getCoords();
    normal = modelVertices[k].getNormal();

    vec3.scale(normal, normal, this.modelHeight/50);
    vec3.add(normal, vertex1, normal);

    vertexNormalsLines[vncount] = vertex1[0]; vertexNormalsLines[vncount+1] = vertex1[1]; vertexNormalsLines[vncount+2] = vertex1[2];
    vertexNormalsLines[vncount+3] = normal[0]; vertexNormalsLines[vncount+4] = normal[1]; vertexNormalsLines[vncount+5] = normal[2];

    vncount += 6;
  }

  // Add data to buffer on GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalsLinesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexNormalsLines, gl.STATIC_DRAW);
  this.loaded += 1;
}

RModel.prototype.loadFaceNormalsLines = function(){
  var polygons = model.getPolygons();

  var polygon; var normal;  var center;

  var faceNormalsLines = new Float32Array(this.polygonsCount*6);
  var fncount = 0;

  for(var i = 0; i < this.polygonsCount; i++){
    polygon = polygons[i];
    normal = polygon.getNormal();
    center = polygon.getGeometricCenter();

    vec3.scale(normal, normal, this.modelHeight/50);
    vec3.add(normal, center, normal);

    faceNormalsLines[fncount] = center[0]; faceNormalsLines[fncount+1] = center[1]; faceNormalsLines[fncount+2] = center[2];
    faceNormalsLines[fncount+3] = normal[0]; faceNormalsLines[fncount+4] = normal[1]; faceNormalsLines[fncount+5] = normal[2];

    fncount += 6;
  }
  // Add data to buffer on GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, this.faceNormalsLinesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, faceNormalsLines, gl.STATIC_DRAW);
  this.loaded += 1;
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

RModel.prototype.setScale = function(scaleFactor){
  this.scale[0] = scaleFactor;
  this.scale[1] = scaleFactor;
  this.scale[2] = scaleFactor;
  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.rescale = function(){
  this.updateAspect();
  this.recalculateMV = true;
  this.recalculateMVP = true;
}

RModel.prototype.reset = function(){
  this.translation = vec3.fromValues(0, 0, 0);
  this.rotationMatrix = mat4.create();
  this.scale = vec3.fromValues(1, 1, 1);
  this.rescale();
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

RModel.prototype.getColorMatrix = function(){
  var polygonsCount = model.getPolygonsCount();
  var polygons = model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  var color;

  var colors = new Float32Array(this.trianglesCount*9);
  var ccount = 0;
  
  for(var i = 0; i < polygonsCount; i++){
    polygon = polygons[i];
    polygonVerticesCount = polygon.getVerticesCount();
    
    for(var j = 1; j < polygonVerticesCount-1; j++){

      if(polygon.isSelected()){
        color = colorConfig.getSelectedColor();
      }else{
        color = colorConfig.getBaseColor();
      }
      colors[ccount] = color[0]; colors[ccount+1] = color[1]; colors[ccount+2] = color[2];
      colors[ccount+3] = color[0]; colors[ccount+4] = color[1]; colors[ccount+5] = color[2];
      colors[ccount+6] = color[0]; colors[ccount+7] = color[1]; colors[ccount+8] = color[2];

      ccount += 9;
    }
  }
  return new Float32Array(colors);;
}

RModel.prototype.getTrianglesBuffer = function(){
  return this.trianglesBuffer;
}

RModel.prototype.getEdgesBuffer = function(){
  return this.edgesBuffer;
}

RModel.prototype.getVerticesBuffer = function(){
  return this.verticesBuffer;
}

RModel.prototype.getTrianglesNormalsBuffer = function(){
  return this.trianglesNormalsBuffer;
}

RModel.prototype.getVerticesNormalsBuffer = function(){
  return this.verticesNormalsBuffer;
}

RModel.prototype.getVertexNormalsLinesBuffer = function(){
  return this.vertexNormalsLinesBuffer;
}

RModel.prototype.getFaceNormalsLinesBuffer = function(){
  return this.faceNormalsLinesBuffer;
}

RModel.prototype.getPolygonsCount = function(){
  return this.polygonsCount;
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
