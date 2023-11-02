"use strict";


class SelectionStrategy {
   constructor(cpuModel, mode) {
      this.polygons = cpuModel.polygons;
      this.mode = mode;
   }

   selectPolygon(polygon) {
      warn("This should be implemented by specific strategies.");
   }

   // Deselecciona todos los polígonos.
   clean() {
      this.polygons.forEach(polygon => polygon.isSelected = false);
   }

   // Aplica el método selectElement sobre todos los polígono.
   select() {
      this.clean();
      this.polygons.forEach(polygon => this.selectPolygon(polygon));
   }

   // Aplica el método selectElement sobre todos los polígono con la propiedad isSelect=true.
   intersect() {
      this.polygons.filter(polygon => polygon.isSelected).forEach(polygon => this.selectPolygon(polygon));
   }

   // Aplica el método selectElement sobre todos los polígono con la propiedad isSelect=false.
   add() {
      this.polygons.filter(polygon => !polygon.isSelected).forEach(polygon => this.selectPolygon(polygon));
   }

   // Aplica el método selectElement sobre todos los polígono con la propiedad isSelect=true y los deselecciona.
   substract() {
      this.polygons.filter(polygon => polygon.isSelected).forEach(polygon => {
         this.selectPolygon(polygon);
         polygon.isSelected = !polygon.isSelected;
      });
   }

   apply() {
      if (this.mode == 'clean') 
         this.select();
      else if (this.mode == 'intersect') 
         this.intersect();
      else if (this.mode == 'add') 
         this.add();
      else if (this.mode == 'substract')
         this.substract();
      else
         console.log("Unsupported Mode");
   }
}