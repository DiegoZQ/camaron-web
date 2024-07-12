"use strict";


class Shape {
   constructor(id) {
      // Crea una figura a partir de un id entero positivo y un estado de selección.
      this.id = id;
      this._isSelected = false;
   }

   get isSelected() {
      return this._isSelected;
   }
   
   set isSelected(value) {
      this._isSelected = value;
   }
}