var SWFObject = function() {
    this.framesLoaded = 0;
    var controlTags = []
    var controlTags_idx = 0;
    var currentFrame = 0;
    var displayDepthList = [];
    var displayTable = {};
    this.appendTag = function(tag) {
        controlTags.push(tag);
    }
    this.playTick = function(player, chara, canvas, action, event) {
        console.debug("SWFObject::playTick");
        var done = false;
        do {
            var tag = controlTags[controlTags_idx++];
            switch (tag.tag_code) {
            case 0: // End
                done = true;
                break;
            case 1: // ShowFramen
                break;
            case 26: // PlaceObject2
                break;
            default:
                console.log(tag);
            }
        } while (tag.tag_code > 1);
        if (done) {
            currentFrame = 0;
            controlTags_idx = 0;
        } else {
            currentFrame++;
        }
    }
}
