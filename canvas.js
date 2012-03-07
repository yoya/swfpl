var SWFCanvas = function(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    this.width  = canvas.width;
    this.height = canvas.height;
    var ctx = canvas.getContext('2d');
    this.createCanvas = function(width, height) {
        var c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        return c;
    }
    this.clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.setBounds = function(minX, minY, maxX, maxY) {
        // TODO: minX, minY
        canvas.width = maxX;
        canvas.height = maxY;
    }
    this.setBackgroundColor = function(rgb) {
        console.debug("SWFCanvas::setBackgroundColor");
        var cssText = "rgb("+rgb.Red+","+rgb.Green+","+rgb.Blue+")";
        canvas.style.backgroundColor = cssText;
    }
    this.drawVectors = function(character, matrix, chara) {
        console.debug("SWFCanvas::drawVector");
        var bounds = character.bounds;
        var vectors = character.vectors;
        console.debug(bounds);
        console.debug(vectors);
        var minX = 0, minY = 0;
        if (bounds.Xmin < 0) {
            minX = bounds.Xmin / 20;
        }
        if (bounds.Ymin < 0) {
            minY = bounds.Ymin / 20;
        }
        ctx.save();
        if (matrix) {
            ctx.transform(matrix.ScaleX, matrix.RotateSkew1, matrix.RotateSkew0, matrix.ScaleY, minX + matrix.TranslateX / 20, minY + matrix.TranslateY / 20);
        }
        this._drawVectors(vectors, minX, minY, chara);
        ctx.restore();
    }
    this._drawVectors = function(vectors, minX, minY, chara) {
        console.debug("SWFCanvas::_drawVectors");
        for (var t = 0 ; t < 2 ; t++) {
            if (t === 0) {
                edgesWithStyle = vectors.fills;
            } else {
                edgesWithStyle = vectors.lines;
            }
            var i = 0 , n = edgesWithStyle.length;
            while (i < n) {
                console.debug(edgesWithStyle);
                var style = edgesWithStyle[i++];
                var fillStyle = "rgba(255, 0, 0, 255)"; // this is error.
                var fillStyleType = style.FillStyleType;
                if (t === 0) { // fill
                    switch (fillStyleType) {
                    case 0x40:
                    case 0x41:
                    case 0x42:
                    case 0x43:
                        var bitmapId = style.BitmapId;
                        if (bitmapId === 65535) {
                            var fillStyle = "rgba(255, 0, 0, 255)";
                        } else {
                            var matrix = style.BitmapMatrix;
                            var bitmap = chara.getCharacter(bitmapId);
                            var image = bitmap.image;
                            var c = this.createCanvas(image.width, image.height);
                            var cx = c.getContext('2d');
                            cx.transform(matrix.ScaleX / 20, matrix.RotateSkew1 / 20, matrix.RotateSkew0 / 20, matrix.ScaleY / 20,  - minX + matrix.TranslateX / 20, - minY + matrix.TranslateY / 20);
                            cx.drawImage(image, 0, 0);
                            if ((fillStyleType === 0x40) || (fillStyleType === 0x42)) {
                                var pattern = ctx.createPattern(c, 'repeat');
                            } else {
                                var pattern = ctx.createPattern(c, 'no-repeat');
                            }
                            fillStyle = pattern;
                        }
                        break;
                    default:
                        console.error("Unknown FillStyleType"+style.FillStyleType);
                        break;
                    }
                    ctx.fillStyle = fillStyle;
                } else { // line
                    ctx.strokeStyle = "rgba(0,5, 0,5, 0,5, 1)";
                }
                var edges = edgesWithStyle[i++];
                ctx.beginPath();
                ctx.moveTo(edges[0] - minX, edges[1] - minY);
                console.debug("ctx.moveTo("+edges[0]+","+edges[1]+")");
                var j = 2, m = edges.length;
                while (j < m) {
                    if (edges[j++]) {
                        ctx.lineTo(edges[j++] - minX, edges[j++] - minY);
                    } else {
                        bezierCurveTo(edges[j++] - minX, edges[j++] - minY,
                                      edges[j++] - minX, edges[j++] - minY);
                    }
                }
                ctx.closePath();
                if (t === 0) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }
        }
    }
}
