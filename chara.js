var SWFChara = function() {
    var characterData = {}; // cid => {...};
    var jpegTables = null;
    this.appendShapeTag = function(tag) {
        console.debug("SWFChara::appendShapeTag");
    }
    this.appendJpegTableTag = function(tag) {
        jpegTables = tag.JPEGData;
    }
    this.appendJpegTag = function(tag) {
        console.debug("SWFChara::appendJpegTag");
        var img = SWFJpeg(imagedata, jpegtables);
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendLosslessTag = function(tag) {
        var img = new Image();
        
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendShapeTag = function(tag) {
        ;
    }
    this.appendSpriteTag = function(tag) {
        console.debug("SWFChara::appendSpriteTag");
        characterData[tag.SpriteID] = {FrameCount:tag.FrameCount, ControlTags:tag.ControlTags};
    }
}
