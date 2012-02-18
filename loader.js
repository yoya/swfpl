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
            loader.parseSWFTags(bitio, chara, object);
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
        player.frameSize  = new SWFRECT(bitio);
        player.frameRate  = bitio.getUI16LE() / 0x100;
        player.frameCount = bitio.getUI16LE();
        console.debug(player);
    }        
    this.parseSWFTags = function(bitio, chara, object, player) {
        console.debug("SWFLoader::parseSWFTags");
        ;        
    }
    
    this.init();
}
