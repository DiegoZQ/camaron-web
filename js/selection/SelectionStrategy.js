"use strict";


class SelectionStrategy {
   constructor(cpuModel, mode) {
      this.polygons = cpuModel.polygons;
      this.mode = mode;
      this.modes = {
         'clean': this.select,
         'intersect': this.intersect,
         'add': this.add,
         'subtract': this.subtract
      };
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
   subtract() {
      this.polygons.filter(polygon => polygon.isSelected).forEach(polygon => {
         this.selectPolygon(polygon);
         polygon.isSelected = !polygon.isSelected;
      });
   }

   apply() {
      if (this.mode in this.modes) 
         this.modes[this.mode]();
      else 
         console.log("Unsupported Mode");
   }
}