var SWFLoader = function(url, chara, object, player) {
    this.bitio = null;
    this.parsedPhase = 0; // 1: Header, 2: MovieHeader 3:?
    var loader = this;
    this.init = function() { // callled from function tail.
        console.debug("SWFLoader::init");
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState > 1) {
                if (request.status == 200) {
                    parse(request.responseText, loader);
                }
            }            
        }
        request.open('GET', url);
        // http://javascript.g.hatena.ne.jp/edvakf/20100607/1275931930
        request.overrideMimeType('text/plain; charset=x-user-defined');
        request.send(null);
    }
    var parse = function(swfdata, loader) {
        console.debug("SWFLoader::parse:"+swfdata.length);
        if (swfdata.length < 16) {
            return ; // skip
        }
        if (loader.bitio === null) {
            loader.bitio = new BitIO();
        }
        var bitio = loader.bitio;
        bitio.input(swfdata);
        if (loader.parsedPhase == 0) {
            if (loader.parseSWFHeader(bitio, player) === false) {
                return false;
            }
            loader.parsedPhase = 1;
        }
        if (loader.parsedPhase == 1) {
            if (loader.parseSWFMovieHeader(bitio, player) === false) {
                return false;
            }
            loader.parsedPhase = 2;
        }
        if (loader.parsedPhase == 2) {
            loader.parseSWFTags(bitio, chara, object, player);
        }
    }
    this.parseSWFHeader = function(bitio, player) {
        console.debug("SWFLoader::parseSWFHeader");
        var signature  = bitio.getData(3);
        var version    = bitio.getUI8();
        var fileLength = bitio.getUI32LE();
        console.debug("Signature:"+signature);
        if (signature !== 'FWS') {
            alert("Signature:"+signature);
            return false;
        }
        console.debug("Version:"+version);
        if (version > 4) {
            alert("Version:"+version);
            return false;
        }
        console.debug("FileLength:"+fileLength);
        loader.FileLength = fileLength;
        return true;
    }
    this.parseSWFMovieHeader = function(bitio, player) {
        console.debug("SWFLoader::parseMovieSWFHeader");
        frameSize = new SWFRECT(bitio);
        player.frameSize  = frameSize;
        player.setBounds(frameSize.Xmin / 20, frameSize.Ymin / 20,
                         frameSize.Xmax / 20, frameSize.Ymax / 20);
        player.frameRate  = bitio.getUI16LE() / 0x100;
        player.frameCount = bitio.getUI16LE();
        console.debug(player);
    }        
    this.parseSWFTags = function(bitio, chara, object, player) {
        console.debug("SWFLoader::parseSWFTags");
	while (true) {
	    bitio.byteAlign();
	    var tag_start_offset = bitio.getOffset().byte_offset;
	    var data_length = bitio.data.length;
	    if (tag_start_offset + 2 > data_length) {
		break;
	    }
	    var tag_and_length = bitio.getUI16LE();
	    var tag_code = tag_and_length >> 6;
	    var length = tag_and_length & 0x3f;
	    if (length === 0x3f) {
		if (tag_start_offset + 6 > data_length) {
		    bitio.setOffset(tag_start_offset, 0);
		    break;
		}
		length = bitio.getUI32LE();
	    }
	    if (tag_start_offset + length > data_length) {
		bitio.setOffset(tag_start_offset, 0);
		break;
	    }
	    var tag_data_start_offset = bitio.byte_offset;
	    var tag = null;
	    switch (tag_code) {
	    case 0: // End
                tag = new SWFEnd(bitio, tag_code, length);
                object.appendTag(tag);
		break;
	    case 1: // ShowFrame
                tag = new SWFShowFrame(bitio, tag_code, length);
                object.appendTag(tag);
                object.framesLoaded++;
		break;
	    case 2: // DefineShape
	    case 22: // DefineShape2
	    case 32: // DefineShape3
		tag = new SWFDefineShape(bitio, tag_code, length);
                chara.appendShapeTag(tag);
		break;
	    case 4: // PlaceObject
	    case 26: // PlaceObject2
		tag = new SWFPlaceObject(bitio, tag_code, length);
                object.appendTag(tag);
		break;
	    case 5: // RemoveObject
	    case 28: // RemoveObject2
		tag = new SWFRemoveObject(bitio, tag_code, length);
                object.appendTag(tag);
		break;
	    case 6: // DefineBits
	    case 21: // DefineBitsJPEG2
	    case 35: // DefineBitsJPEG3
		tag = new SWFDefineBitsJPEG(bitio, tag_code, length);
                chara.appendJpegTag(tag);
		break;
	    case 8: // JPEGTables
		tag = new SWFJPEGTables(bitio, tag_code, length);
                chara.appendJpegTableTag(tag);
		break;
	    case 9: // SetBackgroundColor
		tag = new SWFSetBackgroundColor(bitio, tag_code, length);
                player.setBackgroundColor(tag.BackgroundColor);
		break;
	    case 10: // DefineFont
	    case 48: // DefineFont2
		tag = new SWFDefineFont(bitio, tag_code, length);
		break;
	    case 88: // DefineFontName
		tag = new SWFDefineFontName(bitio, tag_code, length);
		break;
	    case 12: // DoAction
		tag = new SWFDoAction(bitio, tag_code, length);
                object.appendTag(tag);
		break;
	    case 20: // DefineBitsLossless
	    case 36: // DefineBitsLossless2
		tag = new SWFDefineBitsLossless(bitio, tag_code, length);
                chara.appendLosslessTag(tag);
		break;
	    case 24: // Protect
		tag = new SWFProtect(bitio, tag_code, length);
		break;
            case 37: // DefineEditText
		tag = new SWFDefineEditText(bitio, tag_code, length);
		break;
	    case 39: // DefineSprite
                var childObject = new SWFObject();
                object.addChild(childObject);
		tag = new SWFDefineSprite(bitio, tag_code, length, chara, childObject, player);
                chara.appendSpriteTag(tag);
		break;
	    case 43: // FrameLabel
		tag = new SWFFrameLabel(bitio, tag_code, length);
                object.appendTag(tag);
		break;
	    case 46: // DefineMorphShape
		tag = new SWFDefineMorphShape(bitio, tag_code, length);
                chara.appendShapeTag(tag);
		break;
	    default:
		tag = new SWFUnknownTag(bitio, tag_code, length);
		break;
	    }
	    bitio.setOffset(tag_data_start_offset + length, 0);
	    if (tag_code === 0) { // End
		break;
	    }
        }
    }
    
    this.init();
}
