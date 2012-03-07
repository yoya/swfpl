function SWFPlayer(canvas_id) {
    var chara = new SWFChara();
    var canvas = new SWFCanvas(canvas_id);
    var object = new SWFObject();
    var action = new SWFAction();
    var event = new SWFEvent(canvas_id);
    this.load = function(url) {
        this.loader = new SWFLoader(url, chara, object, this);
    }
    this.setBounds = function(minX, minY, maxX, maxY) {
        canvas.setBounds(minX, minY, maxX, maxY);
    }
    this.setBackgroundColor = function(color) {
        canvas.setBackgroundColor(color);
    }
    this.play = function(player) {
        if (typeof player === 'undefined') {
            player = this;
        }
        console.debug("SWFPlayer::play");
        if (typeof player.frameRate === 'undefined') {
            setTimeout(player.play, 100, player);
            return ;
        }
        player.playTick(player, 1000 / player.frameRate);
    }
    this.playTick = function(player, period) {
//        console.debug("SWFPlayer::playTick:"+period);
        var timerId = setTimeout(player.playTick, period, player, period);
        var ret = object.playTick(player, chara, canvas, action, event);
        if (ret === false) {
            clearTimeout(timerId);
            setTimeout(player.playTick, 100, player, period); // quick retry
        }
    }
}
