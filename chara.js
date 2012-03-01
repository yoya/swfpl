var SWFChara = function() {
    var characterData = {}; // cid => {...};
    var jpegTables = null;
    this.getCharacter = function(cid)  {
        return characterData[cid];
    }
    this.appendShapeTag = function(tag) {
        console.debug("SWFChara::appendShapeTag");
	var vectors = new SWFVector(tag.Shapes.FillStyles.FillStyles,
				   tag.Shapes.LineStyles.LineStyles,
				   tag.Shapes.ShapeRecords);
        characterData[tag.ShapeId] = {bounds:tag.ShapeBounds, vectors:vectors};
    }
    this.appendJpegTableTag = function(tag) {
        jpegTables = tag.JPEGData;
    }
    this.appendJpegTag = function(tag) {
        console.debug("SWFChara::appendJpegTag");
        var img = SWFJpeg(tag.ImageData, jpegTables);
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendLosslessTag = function(tag) {
        var img = new Image();
	pngData = SWFLossless(tag.tag_code, tag.BitmapFormat, tag.BitmapWidth, tag.BitmapHeight, tag.BitmapColorTableSize, tag.ZlibBitmapData);
	img.src = "data:image/png;base64,"+base64encode(pngData);
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendSpriteTag = function(tag) {
        console.debug("SWFChara::appendSpriteTag");
        characterData[tag.SpriteID] = {FrameCount:tag.FrameCount, ControlTags:tag.ControlTags};
    }
}
