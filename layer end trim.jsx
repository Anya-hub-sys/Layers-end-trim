(function () {
    app.beginUndoGroup("Sequential Trim Selected Layers");

    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Please open a composition first.");
        app.endUndoGroup();
        return;
    }

    var layers = comp.selectedLayers;

    if (layers.length === 0) {
        alert("Please select the layers you want to trim.");
        app.endUndoGroup();
        return;
    }

    // Enter the number of frames between each cut.
    // Examples:
    // 5       = 5 frames between every layer
    // 5,3,5   = 5 frames, then 3, then 5, then repeat
    var input = prompt(
        "Enter the frame sequence:",
        "5"
    );

    if (input === null) {
        app.endUndoGroup();
        return;
    }

    var parts = input.split(",");
    var steps = [];

    for (var i = 0; i < parts.length; i++) {
        var value = parseInt(parts[i], 10);

        if (isNaN(value) || value < 0) {
            alert("Enter valid frame numbers.\nExample: 5 or 5,3,5");
            app.endUndoGroup();
            return;
        }

        steps.push(value);
    }

    var frameDuration = comp.frameDuration;

    // Sort selected layers according to their position in the timeline.
    // This makes the sequence follow top-to-bottom.
    layers.sort(function (a, b) {
        return a.index - b.index;
    });

    // Current cursor position = first cut point.
    var cutPoint = comp.time;

    for (var j = 0; j < layers.length; j++) {

        // First layer is cut exactly at the cursor.
        // Every following layer moves backward cumulatively.
        if (j > 0) {
            var step = steps[(j - 1) % steps.length];
            cutPoint -= step * frameDuration;
        }

        // Only change the layer's end.
        // The layer itself is NOT moved.
        if (cutPoint > layers[j].inPoint) {
            layers[j].outPoint = cutPoint;
        } else {
            layers[j].outPoint = layers[j].inPoint;
        }
    }

    app.endUndoGroup();
})();