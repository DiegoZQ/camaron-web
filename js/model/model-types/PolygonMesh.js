"use strict";

// requires "./CPUModel";


class PolygonMesh extends VertexCloud {
   constructor() {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = [];
   }

   get availableRenderers() {
      return [
         'face_renderer', 
         'vertex_renderer', 
         'flat_renderer', 
         'none_renderer', 
         'wireframe_renderer', 
         'vertex_cloud_renderer', 
         'face_normals_renderer', 
         'vertex_normals_renderer', 
         'face_id_renderer', 
         'vertex_id_renderer'
      ]
   }

   get activeRenderers() {
      return [
         'face_renderer'
      ]
   }
}