var canvas = document.getElementById("glCanvas");

var gl = canvas.getContext("webgl2");
if (!gl) {alert("No WebGL");}

var fileArray = ["OFF", "8 6 0", "-0.500000 -0.500000 0.500000", "0.500000 -0.500000 0.500000", "-0.500000 0.500000 0.500000", "0.500000 0.500000 0.500000", "-0.500000 0.500000 -0.500000", "0.500000 0.500000 -0.500000", "-0.500000 -0.500000 -0.500000", "0.500000 -0.500000 -0.500000", "4 0 1 3 2", "4 2 3 5 4", "4 4 5 7 6", "4 6 7 1 0", "4 1 7 5 3", "4 6 0 2 4"];
var loader;
var model;
var rModel;

describe("Model and RModel", function(){
	beforeEach(function() {
    	loader = new OffLoadStrategy(fileArray);
    	model = loader.load();
    	rModel = new RModel(model);
    	rModel.loadData();
    	rModel.loadTriangles();
  	});

	it("loader should be valid", function() {
    	expect(loader.isValid()).toEqual(true);
  	});

  	it("model and rmodel shoud be defined", function() {
    	expect(model).not.toEqual(undefined);
    	expect(rModel).not.toEqual(undefined);
  	});

  	it("model polygons count should be 6", function() {
    	expect(model.getPolygonsCount()).toEqual(6);
  	});

  	it("model vertices count should be 8", function() {
    	expect(model.getVerticesCount()).toEqual(8);
  	});

  	it("model bounds should be correct", function() {
    	expect(model.getBounds()).toEqual([-0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);
  	});

  	it("rmodel polygons and vertices count should be the same", function() {
  		expect(rModel.getPolygonsCount()).toEqual(model.getPolygonsCount());
    	expect(rModel.getVerticesCount()).toEqual(model.getVerticesCount());
  	});

  	it("rmodel triangles count should be greater than its polygons count", function() {
  		expect(rModel.getTrianglesCount()).toBeGreaterThan(model.getPolygonsCount());
  	});
})


describe("Selection", function(){
	beforeEach(function() {
    	loader = new OffLoadStrategy(fileArray);
    	model = loader.load();
  	});

  // TODO
  it("selection test", function() {
    expect(true).toEqual(true);
  });

})

describe("Evaluation", function(){
	beforeEach(function() {
    	loader = new OffLoadStrategy(fileArray);
    	model = loader.load();
  	});

  // TODO
  it("evaluation test", function() {
    expect(true).toEqual(true);
  });

})
