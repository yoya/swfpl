// fill vector , line vector}
// convert SWF SHAPE RECORDS to SWFPL Vector
// fill: {edges, [color, bitmap, gradient]}
// line: {width: color}

var SWFVector = function(fillStyles, lineStyles, shapeRecords) {
    var convertFillEdges = function(shapeRecords, startOffset, endOffset, fillStyles) {
	var fillEdgesList = []
	console.debug("convertFillEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	for (i = startOffset ; i <= endOffset ; i++) {
	    var record = shapeRecords[i];
	    ;
	}
	return fillEdgesList;
    }
    var convertLineEdges = function(shapeRecords, startOffset, endOffset, lineStyles) {
	var lineEdgesList = []
	//	console.debug("convertLineEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	var lineEdges = [];
	var currentLineStyle = 0;
	var startOfShapeRecords = shapeRecords[startOffset]
	if (startOfShapeRecords.LineStyle) {
	    currentLineStyle = shapeRecords[startOffset].LineStyle;
	}
	for (i = startOffset + 1 ; i <= endOffset ; i++) {
	    var record = shapeRecords[i];
	    if (SWFSTYLECHANGERECORD || (i === endOffset)) {
		if ((('LineStyle' in record) || 
		     (currentLineStyle !== record.LineStyle)) ||
		    (i === endOffset)) {
		    if (currentLineStyle) {
			lineEdgesList.push(lineStyles[currentLineStyle], lineEdges);
		    }
		    var lineEdges = [];
		    currentLineStyle = record.LineStyle;
		}
	    } else {
		lineEdges.push(record);
	    }
	}
	return lineEdgesList;
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
	if (('MoveX' in record) || (i === (n - 1))) {
	    endOffset = i - 1;
	    edgesWithFillStyles = convertFillEdges(shapeRecords, startOffset, endOffset, fillStyles);
	    edgesWithLineStyles = convertLineEdges(shapeRecords, startOffset, endOffset, lineStyles);
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
