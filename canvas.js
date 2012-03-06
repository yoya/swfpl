var SWFCanvas = function(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    this.width  = canvas.width;
    this.height = canvas.height;
    var ctx = canvas.getContext('2d');
    this.clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        ctx.save();
        ctx.transform(matrix.ScaleX, matrix.RotateSkew1, matrix.RotateSkew0, matrix.ScaleY, matrix.TranslateX / 20, matrix.TranslateY / 20);
        this._drawVectors(vectors, chara);
        ctx.restore();
    }
    this._drawVectors = function(vectors, chara) {
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
                        var bitmap = chara.getCharacter(style.BitmapId);
                        if ((fillStyleType === 0x40) || (fillStyleType === 0x42)) {
                            var pattern = ctx.createPattern(bitmap.image,'repeat');
                        } else {
                            var pattern = ctx.createPattern(bitmap.image,'no-repeat');
                        }
                        fillStyle = pattern;
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
                ctx.moveTo(edges[0], edges[1]);
                console.debug("ctx.moveTo("+edges[0]+","+edges[1]+")");
                var j = 2, m = edges.length;
                while (j < m) {
                    if (edges[j++]) {
                        ctx.lineTo(edges[j++], edges[j++]);
                    } else {
                        bezierCurveTo(edges[j++], edges[j++],
                                      edges[j++], edges[j++]);
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
