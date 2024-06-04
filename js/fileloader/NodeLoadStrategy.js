"use strict";


class NodeLoadStrategy extends ModelLoadStrategy {
   load() {
      this.model = new VertexCloud();
      this.loadModelVertices();
      this.model.vertices = Array.from(Object.values(this.model.vertices));
   }

   // Carga los vértices del archivo .node (guardado en fileArray) en el modelo.
   // Cada vértice es de la forma: <id> <x> <y> <z> <...atributos> <marker>[Opcional]. 
   // https://wias-berlin.de/software/tetgen/fformats.node.html
   loadModelVertices() {
      const vertexLineWords = getLineWords(this.fileArray[0]);
      if (![2,3,4].includes(vertexLineWords.length) || !isPositiveInteger(vertexLineWords[0]) || !['2', '3'].includes(vertexLineWords[1])) {
          throw new Error('Vertex header format error');
      }
      const [numVertices, dimensions] = [parseInt(vertexLineWords[0]), parseInt(vertexLineWords[1])];
      super.loadModelVertices(numVertices, 1, dimensions, true);
  }

   _exportToNode() {
      return this.fileArray.join('\n');
   }
}