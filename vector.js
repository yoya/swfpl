// fill vector , line vector}
// convert SWF SHAPE RECORDS to SWFPL Vector
// fill: {edges, [color, bitmap, gradient]}
// line: {width: color}

var SWFVector = function(fillStyles, lineStyles, shapeRecords) {
    var convertFillEdges = function(shapeRecords, startOffset, endOffset, fillStyles, currentX, currentY) {
	console.debug("convertFillEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	var fillEdgesParts = [];
	var currentFillStyle0 = 0, currentFillStyle1 = 0;
	var startOfRecord = shapeRecords[startOffset];
	var fillEdges = [currentX, currentY];
	if (startOfRecord.FillStyle0) {
	    currentFillStyle0 = shapeRecords[startOffset].FillStyle0;
	}
	if (startOfRecord.FillStyle1) {
	    currentFillStyle1 = shapeRecords[startOffset].FillStyle1;
	}
	for (i = startOffset + 1; i <= endOffset ; i++) {
	    var record = shapeRecords[i];
	    //
	    //
	    //
	}
	// combining edges by style
	var fillEdgesList = [];
	for (style in fillEdgesParts) {
	    var fillEdges = fillEdgesParts[style];
	    if (fillEdges.length <= 1) {
		continue; // skip
	    }
	    
	}
	return fillEdgesList;
    }
    var convertLineEdges = function(shapeRecords, startOffset, endOffset, lineStyles, currentX, currentY) {
	var lineEdgesList = []
	//	console.debug("convertLineEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	var lineEdges = [currentX, currentY];
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
    var currentPosition = {x:0, y:0};
    
    for (i = 1, n = shapeRecords.length ; i < n ; i++) {
	var record = shapeRecords[i];
	if (('MoveX' in record) || (i === (n - 1))) {
	    if ('MoveX' in record) {
		currentPosition.x = record.MoveX;
		currentPosition.y = record.MoveY;
	    }
	    endOffset = i - 1;
	    edgesWithFillStyles = convertFillEdges(shapeRecords, startOffset, endOffset, fillStyles, currentPosition);
	    edgesWithLineStyles = convertLineEdges(shapeRecords, startOffset, endOffset, lineStyles, currentPosition);
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
