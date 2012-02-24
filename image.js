
function SWFJpeg(imagedata, jpegtables) {
    var img = new Image();
    var bitio = new BitIO();
    bitio.input(tag.ImageData);
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
    image = null;
    return image;
}
