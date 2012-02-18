var SWFChara = function() {
    var characterData = {}; // cid => {...};
    var jpegTables = null;
    this.appendShapeTag = function(tag) {
        console.debug("SWFChara::appendShapeTag");
    }
    this.appendJpegTableTag = function(tag) {
        jpegTables = tag.JPEGData;
    }
    var SOI  = 0xFFD8;
    var SOF0 = 0xFFC0;
    var SOF2 = 0xFFC2;
    var DQT  = 0xFFDB;
    var DHT  = 0xFFC4;
    var SOS  = 0xFFDA;
    var EOI  = 0xFFD9;
    this.appendJpegTag = function(tag) {
        console.debug("SWFChara::appendJpegTag");
        var img = new Image();
        bitio = new BitIO();
        bitio.input(tag.ImageData);
        var marker;
        var dqt = '', dht = '';
        while (marker = bitio.getUI16BE(2)) {
            switch (marker) {
              case SOI:
              case EOI:
                break;
              default:
                var len = bitio.getUI16BE(2);
                bitio.incrementOffset(len - 2, 0);
                break;
              case SOF0:
              case SOF2:
                var len = bitio.getUI16BE(2);
                bitio.incrementOffset(-4, 0);
                var sof = bitio.getData(len + 2);
                break;
              case DQT:
                var len = bitio.getUI16BE(2);
                bitio.incrementOffset(-4, 0);
                dqt += bitio.getData(len + 2);
                break;
              case DHT:
                var len = bitio.getUI16BE(2);
                bitio.incrementOffset(-4, 0);
                dht += bitio.getData(len + 2);
                break;
              case SOS:
                bitio.incrementOffset(-2, 0);
                var sos_eoi = bitio.getDataUntil(null);
                break;
            }

        }
        if (typeof dqt === '') {
            dqt_dht = jpegTables;
        } else {
            dqt_dht = dqt + dht;
        }
        var jpegData = "\xFF\xD8" + sof + dqt_dht + sos_eoi;
        img.src = "data:image/jpeg;base64,"+base64encode(jpegData);
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendLosslessTag = function(tag) {
        var img = new Image();
        characterData[tag.CharacterID] = {image:img};
    }
    this.appendSpriteTag = function(tag) {
        console.debug("SWFChara::appendSpriteTag");
        characterData[tag.SpriteID] = {FrameCount:tag.FrameCount, ControlTags:tag.ControlTags};
    }
}
