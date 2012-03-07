var SWFChara = function() {
    var characterData = {}; // cid => {...};
    var jpegTables = null;
    var loading = 0;
    this.loaded = function() {
        return (loading === 0)?true:false;
    }
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
        var jpegData = SWFJpeg(tag.ImageData, jpegTables);
        var img = new Image();
        img.src = "data:image/jpeg;base64,"+base64encode(jpegData);
        loading++;
        img.onload = function() { loading--; }
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendLosslessTag = function(tag) {
	var pngData = SWFLossless(tag.tag_code, tag.BitmapFormat, tag.BitmapWidth, tag.BitmapHeight, tag.BitmapColorTableSize, tag.ZlibBitmapData);
    var img = new Image();
        img.src = "data:image/png;base64,"+base64encode(pngData);
        loading++;
        img.onload = function() { loading--; }
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendSpriteTag = function(tag) {
        console.debug("SWFChara::appendSpriteTag");
        characterData[tag.SpriteID] = {FrameCount:tag.FrameCount, ControlTags:tag.ControlTags};
    }
}
