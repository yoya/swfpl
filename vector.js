// fill vector , line vector}
// convert SWF SHAPE RECORDS to SWFPL Vector
// fill: {edges, [color, bitmap, gradient]}
// line: {width: color}

var SWFVector = function(fillStyles, lineStyles, shapeRecords) {
    var convertFillEdges = function(shapeRecords, startOffset, endOffset) {
	console.debug("startOffset:"+startOffset+" endOffset:"+endOffset);
	return [];
    }
    console.debug("SWFVector");
    console.debug(fillStyles);
    console.debug(lineStyles);
    console.debug(shapeRecords);
    var fills = [];
    var lines = [];
    var startOffset = 0;
    for (i = 1, n = shapeRecords.length ; i < n ; i++) {
	var record = shapeRecords[i];
	console.debug('record['+i+']');
	console.debug(record);
	if (record.moveX || (record instanceof SWFENDSHAPERECORD)) {
	    endOffset = i - 1;
	    edgesWithFillStyles = convertFillEdges(shapeRecords, startOffset, endOffset);
	    //
	    // next paths
	    if (record.FillStyles) {
		fillStyles = record.FillStyles.FillStyles;
		lineStyles = record.LineStyles.LineStyles;
	    }
	    startOffset = i;
	}
    }
    return {fills:fills, lines:lines};
}
