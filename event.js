var SWFEvent = function(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    this.press = function(e) {
	console.debug("SWFEvent:press");
	if (e.touches) {
	    var x = e.touches[0].pageX;
	    var y = e.touches[0].pageY;
	} else {
	    var x = e.x;
	    var y = e.y;
	}
	console.debug("x:"+x+", y:"+y);
    }
    this.release = function(e) {
	console.debug("SWFEvent:release");
	if (e.touches) {
	    var x = e.touches[0].pageX;
	    var y = e.touches[0].pageY;
	} else {
	    var x = e.x; // XXX
	    var y = e.y; // XXX
	}
	console.debug("x:"+x+", y:"+y);
    }
    canvas.addEventListener('mousedown', this.press);
    canvas.addEventListener('mouseup', this.release);
}