var SWFObject = function() {
    this.framesLoaded = 0;
    var controlTags = []
    var controlTags_idx = 0;
    var currentFrame = 0;
    this.appendTag = function(tag) {
        controlTags.push(tag);
    }
    this.playTick = function(player, chara, canvas, action, event) {
        console.debug("SWFObject::playTick");
        do {
            var tag = controlTags[controlTags_idx++];
            switch (tag.tag_code) {
            case 1:
            default:
                console.log(tag);
            }
        } while (tag.tag_code > 1);
        currentFrame++;
    }
}
