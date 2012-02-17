function SWFPlayer(canvas_id, url) {
    var canvas = document.getElementById(canvas_id);
    var chara = new SWFChara();
    var canvas = new SWFCanvas(canvas_id);
    var object = new SWFObject();
    var action = new SWFAction();
    var event = new SWFEvent();
    this.load = function() {
        this.loader = new SWFLoader(url, chara, object);
    }
    this.play = function() {
        console.debug("SWFPlayer::play");
    }
}
