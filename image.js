
function SWFJpeg(imageData, jpegtables) {
    var img = new Image();
    var bitio = new BitIO();
    bitio.input(imageData);
    var marker;
    var dqt = '', dht = '';
    while (marker = bitio.getUI16BE(2)) {
        switch (marker) {
        case 0xFFD8: // SOI
        case 0xFFD9: // EOI
            break;
        default:
            var len = bitio.getUI16BE(2);
            bitio.incrementOffset(len - 2, 0);
            break;
        case 0xFFC0: // SOF0
        case 0xFFC2: // SOF2
            var len = bitio.getUI16BE(2);
            bitio.incrementOffset(-4, 0);
            var sof = bitio.getData(len + 2);
            break;
        case 0xFFDB: // DQT
            var len = bitio.getUI16BE(2);
            bitio.incrementOffset(-4, 0);
            dqt += bitio.getData(len + 2);
            break;
        case 0xFFC4: // DHT
            var len = bitio.getUI16BE(2);
            bitio.incrementOffset(-4, 0);
            dht += bitio.getData(len + 2);
            break;
        case 0xFFDA: // SOS
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
    return img;
}


function SWFLossless(tag_code, format, width, height, colorTableSize, zlibBitmap) {
    bitio = new BitIO();
    var pngChunks = [];
    if (format === 3) { // palette
	var colorType = 3; // COLOR_TYPE_PALETTE;
    } else if (tag_code === 20) { // 15bit or 24bit color
	var colorType = 2; // COLOR_TYPE_RGB;
    } else { // 32bit or 24bit color
	var colorType = 6; // COLOR_TYPE_RGB_ALPHA;
    }
    var headerData = [bitio.fromUI32BE(width), bitio.fromUI32BE(height), "\x08", String.fromCharCode(colorType), "\0\0\0"].join("");
    pngChunks.push("IHDR" + headerData);
    var bitmapData = zlib_inflate(zlibBitmap);
    var idatData = [];
    if (format === 3) { // palette format
	if (tag_code === 20) {// no transparent
	    var colorTableRGB = bitmapData.substr(0, 3 * colorTableSize);
	    pngChunks.push("PLTE" + colorTableRGB);
	    var colormapPixelDataOffset = 3 * colorTableSize;
	} else {
	    var paletteData = [];
	    var transData = [];
	    for (var i = 0, n = 4 * colorTableSize; i < n ; i += 4) {
		paletteData.push(bitmapData.substr(i, 3));
		transData.push(bitmapData.substr(i+3, 1));
	    }
	    pngChunks.push("PLTE" + paletteData.join(''));
	    pngChunks.push("tRNS" + transData.join(''));
	    var colormapPixelDataOffset = 4 * colorTableSize;
	}
	var padding_width = (width % 4)?(4 - (width % 4)):0;
	for (var y = 0 ; y < height ; y++) {
	    idatData.push("\0", bitmapData.substr(colormapPixelDataOffset, width));
	    colormapPixelDataOffset += width + padding_width;
	}
    } else if (format === 4) {// 15bit color 
	var bitmapDataOffset = 1;
	var padding_width = (width % 2)?2:0;
	for (var y = 0 ; y < height ; y++) {
	    idatData.push("\0");
	    for (var x = 0 ; x < width ; x++) {
		var rgb15 = bitio.toUI16LE(bitmapData.substr(bitmapDataOffset, 2));
		var r8 = (rgb15 >>> 7) & 0xf8;
		var g8 = (rgb15 >>> 2) & 0xf8;
		var b8 = (rgb15 <<  3) & 0xf8;
		idatData.push(String.fromCharCode(r8),
			      String.fromCharCode(g8),
			      String.fromCharCode(b8));
		bitmapDataOffset += 2;
	    }
	    bitmapDataOffset += padding_width;
	}
    } else { // 32bit or 24bit color
	if (tag_code === 20) {// no transparent
	    var bitmapDataOffset = 1;
	    for (var y = 0 ; y < height ; y++) {
		idatData.push("\0");
		for (var x = 0 ; x < width ; x++) {
		    idatData.push(bitmapData.substr(bitmapDataOffset, 3));                        
		    bitmapDataOffset += 4;
		}
	    }
	} else {
	    var bitmapDataOffset = 0;
	    for (var y = 0 ; y < height ; y++) {
		idatData.push("\0");
		for (var x = 0 ; x < width ; x++) {
		    idatData.push(bitmapData.substr(bitmapDataOffset+1, 3)); // RGB
		    idatData.push(bitmapData.substr(bitmapDataOffset, 1)); // ALPHA
		    bitmapDataOffset += 4;
		}
	    }
	}
    }
    var idatZlibData = zlib_deflate(idatData.join(""), 0, 0);
    pngChunks.push("IDAT" + idatZlibData);
    delete bitmapData;
    delete idatZlibData;
    var pngChunksWithCRC32 = ["\x89PNG\r\n\x1A\n"]; // header
    for (var i = 0, n = pngChunks.length ; i < n ; i++) {
	var chunk = pngChunks[i];
	pngChunksWithCRC32.push(bitio.fromUI32BE(chunk.length - 4));
	pngChunksWithCRC32.push(chunk);
	pngChunksWithCRC32.push(bitio.fromUI32BE(crc32(chunk)));
    }
    delete colorType;
    var pngData = pngChunksWithCRC32.join("");
    delete pngChunksWithCRC32;
    var img = new Image();
    img.src = "data:image/png;base64,"+base64encode(pngData);
    
}
