"use strict";

var Translator = function(){
  this.width = gl.canvas.clientWidth;
  this.height = gl.canvas.clientHeight;
  this.startX;
  this.startY;
  this.v = vec3.create();
};

Translator.prototype.setMovementStart = function(win_x, win_y){
  this.startX = win_x;
  this.startY = win_y;
}

Translator.prototype.moveTo = function(win_x, win_y){
  this.endX = win_x;
  this.endY = win_y;

  var dx = this.startX - this.endX;
  var dy = this.startY - this.endY;
  
  this.v[0] += -dx;
  this.v[1] +=  dy;
  this.v[2] +=  0.0;

  this.startX = this.endX;
  this.startY = this.endY;
}

Translator.prototype.getMovementVector = function(){
  return this.v;
}

Translator.prototype.rescale = function(){
  this.width = gl.canvas.clientWidth;
  this.height = gl.canvas.clientHeight;
}

Translator.prototype.reset = function(){
  this.rescale();
  this.v = vec3.create();
}