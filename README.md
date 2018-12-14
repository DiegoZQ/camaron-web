# CAMARON WEB

CAMARON WEB is a mesh visualizer focused on inspecting and evaluating the quality of meshes. It does not require any installation, nor configuration. You just need to download the repository and open the HTML file. Currently it supports opening files in the following formats:

* OFF

## Main Features

### 1 Inspecting Meshes

Once a mesh is loaded, camaron web allows the user to move, rotate and scalate the mesh. In case of 3D meshes, its possible to visualize inside the mesh. It also allows to change the projection between "perspective" and orthogonal.

### 2 Change Illumination

Camaron Web allows to visualize meshes in 3 different ways:

1. "Blocky" Surface: Done by using the faces normals
2. Smooth Surface: Done by using the vertices normals
3. Flat Surface: Every face is the same color, no illumination

It also allows to not draw the surface at all !! This is useful if you want to visualize properties of the mesh without seeing the mesh surface itself.

### 3 Visualize Mesh Properties

As stated at the end of the last section, it is possible to visualize mesh properties. Currently the application allows to see 4 properties:

1. Wireframe of the mesh
2. Vertex Cloud
3. Faces Normals
4. Vertices Normals

### 4 Select Faces

The application lets the user select a property, and select the faces of the mesh that complies with certain criteria regarding the property (usually a range). The selection is visible by painting the selected faces in a red color. Currently the properties supported are:

1. Internal Angles
2. Polygons Area
3. Polygons IDs

### Evaluate the Mesh

Finally, camaron web allows to run a evaluation on the mesh regarding some property. The result of the evaluation consist on graphics regarding the selected property. It is possible to run a evaluation over the whole model, or over an applied selection. The supported properties so far are:

1. Internal Angles
2. Polygons Area
3. Polygons Edges Number


## Extending the Application

This application was created with the objective of making it easy to extend its existing functionalities. It is possible to add new selection and evaluation methods easily. New illumination models and properties are harder, because they depend on shaders, but they are also possible.

### Adding a new Selection Method

For each new selection method a js file should be created in the "js/selection/" directory. In this file create an object that extends from the object "SelectionStrategy" defined in "js/selection/selection-base.js". This new object should also implement the methods "selectElement" and "getText". The template for this object is as follows:

```

var NewSelectionStrategy = function(model, mode, **extra variables**){				
	SelectionStrategy.call(this, model, mode);
	**Extra Code**
}

NewSelectionStrategy.prototype = Object.create(SelectionStrategy.prototype);
NewSelectionStrategy.prototype.constructor = NewSelectionStrategy;

NewSelectionStrategy.prototype.selectElement = function(polygon){
	**Code for Selection**
}

AngleSelectionStrategy.prototype.getText = function(){
	**Code for visible text**
}


```

For an Example of how the methods are implemented, you can check "AngleSelectionStrategy" in "js/selection/angle-selection.js".

### Adding a new Evaluation Strategy

This is similar to adding selection methods. A js file should be created in the "js/evaluation/" directory, and create and object that extends from "EvaluationStrategy" located in "js/evaluation/evaluation-base.js". The only method required here is the "evaluate" method. The template is the following:

```

var NewEvaluationStrategy = function(model, mode){									
	EvaluationStrategy.call(this, model, mode);
}

NewEvaluationStrategy.prototype = Object.create(EvaluationStrategy.prototype);
NewEvaluationStrategy.prototype.constructor = NewEvaluationStrategy;

NewEvaluationStrategy.prototype.evaluate = function(element){
	**Code for Evaluate**
}

```

The result of the "evaluate" method should be an object with the result data. Evaluating a model generates an histograms, so for this the created object must have the following structure:

```

{																					
	"title": "title for the histogram",                        						
	"x_axis": "text that will appear in the histogram x axis",
	"list": [a number list with the data to be shown],
	"min": a number with the minimum value found,
	"max": a number with the maximum value found
}

```

Notice that so far the application only supports adding evaluation properties based on numerical data.

### Adding the new Selection and Evaluation methods to the UI

This section will be written in the future, because we are working on a more generic solution to do this (in the current version, this action is mostly done manually).