var OffLoadStrategy = function(fileArray){
  ModelLoadStrategy.call(this);
  this.fileArray = fileArray;
  this.vertexStart = 0;
  this.polygonStart = 0;
}

OffLoadStrategy.prototype = Object.create(ModelLoadStrategy.prototype);
OffLoadStrategy.prototype.constructor = OffLoadStrategy;

OffLoadStrategy.prototype.isValid = function(){
  var valid = false;
  if(this.fileArray[0].split(' ').filter(Boolean)[0].trim() == 'OFF'){
    valid=true;
  }
  return valid;
}

OffLoadStrategy.prototype.load = function(){
  var model = this.readHeader();
  this.readVertices(model);
  if(model.modelType == 'PolygonMesh'){
    this.readPolygons(model)
    this.completeMesh(model)
  }
  return model;
}

OffLoadStrategy.prototype.readHeader = function(){
  var line = this.fileArray[0].replace(/\t/g, " ");
  line = line.split(' ').filter(Boolean);
  var verticesCount = null;
  var polygonsCount = null;
  if(line.length > 1){
    verticesCount = line[1];
    polygonsCount = line[2];
    this.vertexStart = 1;
  } else {
    for(var i=1; i<this.fileArray.length-1; i++){
      if(this.fileArray[i] != '' && this.fileArray[i][0] != '#'){
        line = this.fileArray[i].replace(/\t/g, " ");
        line = line.split(' ').filter(Boolean);
        verticesCount = line[0];
        polygonsCount = line[1];
        this.vertexStart = i+1;
        break;
      }
    }
  }


  if(polygonsCount == null || verticesCount == null ) throw new Error('countError');

  if(polygonsCount == 0){
    return new VertexCloud(parseInt(verticesCount));
  } else {
    return new PolygonMesh(parseInt(polygonsCount), parseInt(verticesCount));
  }
}

OffLoadStrategy.prototype.readVertices = function(model){
  var bounds = model.getBounds();
  var vertices = model.getVertices();
  var id = 1; var x; var y; var z;
  var i = this.vertexStart;
  while(i < model.getVerticesCount()+this.vertexStart){
    if(this.fileArray[i] != '' && this.fileArray[i][0] != '#'){
      var line = this.fileArray[i].replace(/\t/g, " ");
      line = line.split(' ').filter(Boolean);
      x = parseFloat(line[0]); y = parseFloat(line[1]); z = parseFloat(line[2]);
      vertices.push(new Vertex(id, x, y, z));
      
      if(bounds.length < 1){ 
        bounds.push(x);
        bounds.push(y);
        bounds.push(z);
        bounds.push(x);
        bounds.push(y);
        bounds.push(z); 
      }
      
      if(bounds[0] > x) {bounds[0] = x;}
      else if(bounds[3] < x) {bounds[3] = x;}

      if(bounds[1] > y) {bounds[1] = y;}
      else if(bounds[4] < y) {bounds[4] = y;}

      if(bounds[2] > z) {bounds[2] = z;}
      else if(bounds[5] < z) {bounds[5] = z;}

      id++; i++;
    }
  }
  this.polygonStart = i;
}

OffLoadStrategy.prototype.readPolygons = function(model){
  var polygonVertices;
  var polygons = model.getPolygons();
  var modelVertices = model.getVertices();
  var id = 1;
  var i = this.polygonStart;
  while(i < model.getPolygonsCount()+this.polygonStart){
    if(this.fileArray[i] != '' && this.fileArray[i][0] != '#'){
      var line = this.fileArray[i].replace(/\t/g, " ");
      line = line.split(' ').filter(Boolean);
      var sidesCount = parseInt(line[0]);

      if(sidesCount === 3){var polygon = new Triangle(id);}
      else{var polygon = new Polygon(id);}

      polygonVertices = polygon.getVertices();

      for(var j=1; j<=sidesCount; j++){
        polygonVertices.push(modelVertices[parseInt(line[j])])
      }

      polygons.push(polygon);

      id++; i++;
    }
  }
}