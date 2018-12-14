  const gpu_triangle_normals = gpu.createKernel(function(x){
    
    var result = 0;

    var U0 = 0; var U1 = 0; var U2 = 0;
    var V0 = 0; var V1 = 0; var V2 = 0; 

    var i = this.thread.x - this.thread.x%9;

    U0 = x[i+3] - x[i];
    U1 = x[i+4] - x[i+1];
    U2 = x[i+5] - x[i+2];

    V0 = x[i+6] - x[i];
    V1 = x[i+7] - x[i+1];
    V2 = x[i+8] - x[i+2];


    if(this.thread.x%3 == 0){
      return U1*V2 - U2*V1;
    };
    if(this.thread.x%3 == 1){
      return U2*V0 - U0*V2;      
    };
    if(this.thread.x%3 == 2){
      return U0*V1 - U1*V0;
    };
  }).setOutput([tcount]);

  trianglesNormals = gpu_triangle_normals(triangles);