// {fill vector , line vector}
// convert SWF SHAPE RECORDS to SWFPL Vector
// fill: {edges, [color, bitmap, gradient]}
// line: {width: color}

var SWFVector = function(fillStyles, lineStyles, shapeRecords) {
    var convertFillEdges = function(shapeRecords, startOffset, endOffset, fillStyles, fillStyle0, fillStyle1, position) {
	console.debug("convertFillEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	var fillEdgesParts = [];
	var startOfRecord = shapeRecords[startOffset];
	var fillEdges = [position.x, position.y];
	console.debug('fillStyle0:'+fillStyle0);
	console.debug('fillStyle1:'+fillStyle1);
	for (i = startOffset; i <= endOffset ; i++) {
	    var record = shapeRecords[i];
	    var hasEdges = false;
	    if (record instanceof SWFSTRAIGHTEDGERECORD) {
		// StraightFlag:1 - Straight Edge
		fillEdges.push(1, record.X, record.Y);
		position.x = record.X;
		position.y = record.Y;
		hasEdges = true;
	    } else if (record instanceof SWFCURVEDEDGERECORD) {
		// StraightFlag:0 - CurvedEdge
		fillEdges.push(0, record.ControlX, record.ControlY, record.AnchorX, record.AnchorY);
		position.x = record.AnchorX;
		position.y = record.AnchorY;
		hasEdges = true;
	    }
	    if ((record instanceof SWFSTYLECHANGERECORD) || (i === endOffset)) {
		if (hasEdges && (fillEdges.length > 2)) {
		    if (fillStyle0) {
			if (! (fillStyle0 in fillEdgesParts)) {
			    fillEdgesParts[fillStyle0] = [];
			}
			fillEdgesParts[fillStyle0].push(fillEdges);
		    }
		    if (fillStyle1) {
			if (! (fillStyle1 in fillEdgesParts)) {
			    fillEdgesParts[fillStyle1] = [];
			}
			fillEdgesParts[fillStyle1].push(fillEdges);
		    }
		    fillEdges = [];
		}
		if ('MoveX' in record) {
		    position.x = record.MoveX;
		    position.y = record.MoveY;
		}
		if (fillEdges.length === 0) {
                    var fillEdges = [position.x, position.y];
		}
	    }
	}
	// combining edges by style
	var fillEdgesList = [];
	for (style in fillEdgesParts) {
	    var fillEdges = fillEdgesParts[style];
	    if (fillEdges.length <= 1) {
		fillEdgesList.push(fillStyles[style - 1]);
		fillEdgesList.push(fillEdges[0]);
	    } else {
                // combine edge
		continue;
	    }
	    
	}
//        console.debug('fillEdgesList');
//        console.debug(fillEdgesList);
	return fillEdgesList;
    }
    var convertLineEdges = function(shapeRecords, startOffset, endOffset, lineStyles, lineStyle, position) {
	var lineEdgesList = []
	//	console.debug("convertLineEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	var lineEdges = [position.x, position.y];
	var startOfShapeRecords = shapeRecords[startOffset]
	if (startOfShapeRecords.LineStyle) {
	    lineStyle = shapeRecords[startOffset].LineStyle;
	}
	for (i = startOffset + 1 ; i <= endOffset ; i++) {
	    var record = shapeRecords[i];
	    if (record instanceof SWFSTYLECHANGERECORD || (i === endOffset)) {
		if ((('LineStyle' in record) || 
		     (lineStyle !== record.LineStyle)) ||
		    (i === endOffset)) {
		    if (lineStyle) {
			lineEdgesList.push(lineStyles[lineStyle], lineEdges);
		    }
		    var lineEdges = [];
		    lineStyle = record.LineStyle;
		}
	    } else {
		lineEdges.push(record);
	    }
	}
//        console.debug('lineEdgesList');
//        console.debug(lineEdgesList);
	return lineEdgesList;
    }
    console.debug("SWFVector");
//    console.debug(fillStyles);
//    console.debug(lineStyles);
//    console.debug(shapeRecords);
    var fills = [];
    var lines = [];
    var startOffset = 0, endOffset;
    var position = {x:0, y:0};
    var fillStyles, lineStyles;
    var fillStyle0 = 0, fillStyle1 = 0, lineStyle = 0;
    var hasEdges = false;
    for (i = 0, n = shapeRecords.length ; i < n ; i++) {
	var record = shapeRecords[i];
	if ((record instanceof SWFSTRAIGHTEDGERECORD) ||
	    (record instanceof SWFCURVEDEDGERECORD)) {
	    hasEdges = true;
	    continue;
	}
	if (('FillStyles' in record) ||
	    (i === (n - 1))) {
	    if (hasEdges) {
		startOffset += 1;
		endOffset = i - 1;
		edgesWithFillStyles = convertFillEdges(shapeRecords, startOffset, endOffset, fillStyles, fillStyle0, fillStyle1, position);
		edgesWithLineStyles = convertLineEdges(shapeRecords, startOffset, endOffset, lineStyles, lineStyle, position);
                for (j = 0, m = edgesWithFillStyles.length ; j < m ; j++) {
                    fills.push(edgesWithFillStyles[j]);
                }
                for (j = 0, m = edgesWithLineStyles.length ; j < m ; j++) {
                    lines.push(edgesWithLineStyles[j]);
                }
		hasEdges = false;
	    }
	}
	if ('MoveX' in record) {
	    position.x = record.MoveX;
	    position.y = record.MoveY;
	}
	if ('FillStyles' in record) {
	    fillStyles = record.FillStyles.FillStyles;
	    lineStyles = record.LineStyles.LineStyles;
	}
	if ('FillStyle0' in record) {
	    fillStyle0 = record.FillStyle0;
	}
	if ('FillStyle1' in record) {
	    fillStyle1 = record.FillStyle1;
	}
	if ('LineStyle' in record) {
	    lineStyle = record.LineStyle;
	}
	startOffset = i;
    }
    return {fills:fills, lines:lines};
}
