"use strict";


class Element {
   constructor(id) {
      // Crea un elemento a partir de un id entero positivo y un estado de selección.
      this.id = id;
      this.selected = false;
   }

   // Obtiene el id de un elemento. 
   getId() {
      return this.id;
   }

   // Verifica si el elemento está seleccionado.
   isSelected() {
      return this.selected;
   }

   // Selecciona un elemento
   setSelected(s) {
      this.selected = s;
   }
}

export default Element;