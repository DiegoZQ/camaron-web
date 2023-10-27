"use strict";


var Triangle = function(id){
    Polygon.call(this, id);
    this.lmin = null;
    this.lmid = null;
    this.lmax = null;
  }
  
  Triangle.prototype = Object.create(Polygon.prototype);
  Triangle.prototype.constructor = Triangle;
  
  Triangle.prototype.getArea = function(){
    if(this.area == null){
      var a = this.getLMax();
      var b = this.getLMid();
      var c = this.getLMin();
      var p = (a+b+c)/2;
      this.area = Math.sqrt(p*(p-a)*(p-b)+(p-c));
    }
    return this.area;
  }
  
  Triangle.prototype.getLMin = function(){
    if(this.lmin == null){
      this.setSides();
    }
    return this.lmin;
  }
  
  Triangle.prototype.getLMid = function(){
    if(this.lmid == null){
      this.setSides();
    }
    return this.lmid;
  }
  
  Triangle.prototype.getLMax = function(){
    if(this.lmax == null){
      this.setSides();
    }
    return this.lmax;
  }
  
  Triangle.prototype.setSides = function(){
    var aux;
    this.lmin = vec3.distance(this.vertices[0].getCoords(), this.vertices[1].getCoords());
    this.lmid = vec3.distance(this.vertices[0].getCoords(), this.vertices[2].getCoords());
    this.lmax = vec3.distance(this.vertices[1].getCoords(), this.vertices[2].getCoords());
    if(this.lmid < this.lmin){
      aux = this.lmid;
      this.lmid = this.lmin;
      this.lmin = aux;
    }
  
    if(this.lmax < this.lmid){
      aux = this.lmax;
      this.lmax = this.lmid;
      this.lmid = aux;
    }
  
    if(this.lmid < this.lmin){
      aux = this.lmid;
      this.lmid = this.lmin;
      this.lmin = aux;
    }
  }
  