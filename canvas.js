var SWFCanvas = function(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    this.width  = canvas.width;
    this.height = canvas.height;
    var ctx = canvas.getContext('2d');
    this.clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.drawVectors = function(character) {
        console.debug("SWFCanvas::drawVector");
        var bounds = character.bounds;
        var vectors = character.vectors;
        console.debug(bounds);
        console.debug(vectors);
    }
}
