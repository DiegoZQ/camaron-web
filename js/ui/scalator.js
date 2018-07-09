var Scalator = function(){
  this.width = gl.canvas.clientWidth;
  this.height = gl.canvas.clientHeight;
  this.f = 1;
};

Scalator.prototype.scale = function(df){
  this.f += df;
  if(this.f < 0) this.f=0;
}

Scalator.prototype.getScaleFactor = function(){
  return this.f;
}

Scalator.prototype.rescale = function(){
  this.width = gl.canvas.clientWidth;
  this.height = gl.canvas.clientHeight;
}

Scalator.prototype.reset = function(){
  this.rescale();
  this.f = 1;
}