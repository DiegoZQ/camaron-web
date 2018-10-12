"use strict";

var Rotator = function(){
  this.width = gl.canvas.clientWidth;
  this.height = gl.canvas.clientHeight;
  this.r = Math.min(this.width, this.height)/2;
  this.q = quat.create();
  this.start;
};

Rotator.prototype.getTrackBallVector = function(win_x, win_y){
  var x, y, z;
  x = (2.0*win_x-this.width)/this.width;
  y = (this.height-2.0*win_y)/this.height;
  z = 0;

  var v = vec3.fromValues(x, y, z);
  var len = vec3.length(v);
  len = (len<1.0) ? len : 1.0;
  z = Math.sqrt(1-len*len);
  v[2] = z;
  vec3.normalize(v, v);

  return v;
}

Rotator.prototype.setRotationStart = function(win_x, win_y){
  this.start = this.getTrackBallVector(win_x, win_y);
}

Rotator.prototype.rotateTo = function(win_x, win_y){
  var end = this.getTrackBallVector(win_x, win_y);
  var axis = vec3.create();
  vec3.cross(axis, end, this.start)
  vec3.normalize(axis, axis);

  var aux = vec3.create();
  vec3.subtract(aux, end, this.start);
  var dis = 0 - vec3.length(aux)*2;

  var curRP = quat.create();
  quat.setAxisAngle(curRP, axis, dis);

  quat.multiply(this.q, curRP, this.q);
  this.start = end;
}

Rotator.prototype.getRotationMatrix = function(){
  var temp = mat4.create();
  if(this.q == null || this.q == undefined){
    return temp;
  }
  mat4.fromQuat(temp, this.q);
  return temp;
}

Rotator.prototype.rescale = function(){
  this.width = gl.canvas.clientWidth;
  this.height = gl.canvas.clientHeight;
  this.r = Math.min(this.width, this.height)/2;
}

Rotator.prototype.reset = function(){
  this.rescale();
  this.q = quat.create();
}

