// {fill vector , line vector}
// convert SWF SHAPE RECORDS to SWFPL Vector
// fill: {edges, [color, bitmap, gradient]}
// line: {width: color}

var SWFVector = function(fillStyles, lineStyles, shapeRecords) {
    var convertEdges = function(shapeRecords, startOffset, endOffset, fillStyles, lineStyles, fillStyle0, fillStyle1, lineStyle, position) {
	console.debug("convertFillEdges: startOffset:"+startOffset+" endOffset:"+endOffset);
	var fillEdgesParts = [];
	var lineEdgesParts = [];
	var startOfRecord = shapeRecords[startOffset];
	var edges = [position.x / 20, position.y / 20];
//	console.debug('fillStyle0:'+fillStyle0);
//	console.debug('fillStyle1:'+fillStyle1)
//	console.debug('lineStyle:'+lineStyle);
	for (var i = startOffset; i <= endOffset ; i++) {
	    var record = shapeRecords[i];
	    var hasEdges = false;
	    if (record instanceof SWFSTRAIGHTEDGERECORD) {
		// StraightFlag:1 - Straight Edge
		edges.push(1, record.X / 20, record.Y / 20);
		position.x = record.X;
		position.y = record.Y;
		hasEdges = true;
	    } else if (record instanceof SWFCURVEDEDGERECORD) {
		// StraightFlag:0 - CurvedEdge
		edges.push(0, record.ControlX / 20, record.ControlY/ 20, record.AnchorX / 20, record.AnchorY / 20);
		position.x = record.AnchorX;
		position.y = record.AnchorY;
		hasEdges = true;
	    }
	    if ((record instanceof SWFSTYLECHANGERECORD) || (i === endOffset)) {
		if (hasEdges && (edges.length > 2)) {
		    if (fillStyle0) {
			if (! (fillStyle0 in fillEdgesParts)) {
			    fillEdgesParts[fillStyle0] = [];
			}
			fillEdgesParts[fillStyle0].push(edges);
		    }
		    if (fillStyle1) {
			if (! (fillStyle1 in fillEdgesParts)) {
			    fillEdgesParts[fillStyle1] = [];
			}
			fillEdgesParts[fillStyle1].push(edges);
		    }
		    if (lineStyle) {
			if (! (lineStyle in lineEdgesParts)) {
			    fillEdgesParts[fillStyle1] = [];
			}
			fillEdgesParts[fillStyle1].push(edges);
                    }
		    edges = [];
		}
		if ('MoveX' in record) {
		    position.x = record.MoveX;
		    position.y = record.MoveY;
		}
		if (edges.length === 0) {
                    var edges = [position.x / 20, position.y / 20];
		}
	    }
	}
	// combining edges by style
	var fillEdgesList = [];
	var lineEdgesList = [];
	for (var style in fillEdgesParts) {
	    var fillEdges = fillEdgesParts[style];
	    if (fillEdges.length <= 1) {
		fillEdgesList.push(fillStyles[style - 1]);
		fillEdgesList.push(fillEdges[0]);
	    } else {
                // combine edge
	    }
	    
	}
	for (var style in lineEdgesParts) {
	    var lineEdges = lineEdgesParts[style];
            for (var i = 0, n = lineEdges.length ; i < n ; i++) {
		lineEdgesList.push(lineStyles[style - 1]);
		lineEdgesList.push(lineEdges[i]);
	    }
	}
//        console.debug('fillEdgesList');
//        console.debug(fillEdgesList);
	return {fills:fillEdgesList, lines:lineEdgesList};
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
    for (var i = 0, n = shapeRecords.length ; i < n ; i++) {
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
		edgesWithStyles = convertEdges(shapeRecords, startOffset, endOffset, fillStyles, lineStyles, fillStyle0, fillStyle1, lineStyle, position);
                for (var j = 0, m = edgesWithStyles.fills.length ; j < m ; j++) {
                    fills.push(edgesWithStyles.fills[j]);
                }
                for (var j = 0, m = edgesWithStyles.lines.length ; j < m ; j++) {
                    lines.push(edgesWithStyles.lines[j]);
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
