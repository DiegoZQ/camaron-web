"use strict";


class SelectionStrategy {
   constructor(model, mode) {
      this.polytopes = this.getModelMainPolytopes(model);
      this.model = model;
      this.mode = mode;
   }

   // Obtiene los polítopos principales de cada modelo.
   getModelMainPolytopes(model) {
      if (model.modelType === 'PolygonMesh') {
         return model.polygons;
      }
      if (model.modelType === 'PolyhedronMesh') {
         return model.polyhedrons;
      }
   }

   selectPolytope(polytope) {
      warn("This should be implemented by specific strategies.");
   }

   // Deselecciona todos los polítopos.
   clean() {
      this.polytopes.forEach(polytope => polytope.isSelected = false);
   }

   // Aplica el método selectElement sobre todos los polítopos.
   select() {
      this.clean();
      this.polytopes.forEach(polytope => this.selectPolytope(polytope));
   }

   // Aplica el método selectElement sobre todos los polítopos con la propiedad isSelect=true.
   intersect() {
      this.polytopes.filter(polytope => polytope.isSelected).forEach(polytope => this.selectPolytope(polytope));
   }

   // Aplica el método selectElement sobre todos los polítopos con la propiedad isSelect=false.
   add() {
      this.polytopes.filter(polytope => !polytope.isSelected).forEach(polytope => this.selectPolytope(polytope));
   }

   // Aplica el método selectElement sobre todos los polítopos con la propiedad isSelect=true y los deselecciona.
   substract() {
      this.polytopes.filter(polytope => polytope.isSelected).forEach(polytope => {
         this.selectPolytope(polytope);
         polytope.isSelected = !polytope.isSelected;
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