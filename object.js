var SWFObject = function() {
    this.framesLoaded = 0;
    var controlTags = []
    var controlTags_idx = 0;
    var currentFrame = 0;
    var displayListTable = {}; // depth => ...
    this.appendTag = function(tag) {
        controlTags.push(tag);
    }
    this.showFrame = function(chara, canvas) {
        console.log("showFrame");
        console.log(displayListTable);
        var depthList = [];
        for (var depth in displayListTable) {
            depthList.push(depth);
        }
        if (typeof depthList[0] === 'undefined') {
            console.log("depthList[0] === undefined");
            return ; // nothing to do
        }
        depthList = depthList.sort();
        for (var i = 0, n = depthList.length ; i < n ; i++) {
            var depth = depthList[i];
	    //            console.log('depth:'+depth);
	    //            console.log(depthList);
            var place = displayListTable[depth];
            // console.log(place);
            var character = chara.getCharacter(place.CharacterId);
            console.log(character);
        }
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
                this.showFrame(chara, canvas);
                break;
            case 26: // PlaceObject2
                if (tag.PlaceFlagHasMove) {
                    if (tag.PlaceFlagHasCharaceter) {
                        displayListTable[tag.Depth].CharacterId = tag.CharacterId;
                    }
                    if (tag.PlaceFlagHasMatrix) {
                        displayListTable[tag.Depth].Matrix = tag.Matrix;
                    }
                    if (tag.PlaceFlagHasColorTransform) {
                        displayListTable[tag.Depth].ColorTransform = tag.ColorTransform;
                    }
                    if (tag.PlaceFlagHasRatio) {
                        displayListTable[tag.Depth].Ratio = tag.Ratio;
                    }
                    if (tag.PlaceFlagHasName) {
                        displayListTable[tag.Depth].Name = tag.Name;
                    }
                } else {
                    displayListTable[tag.Depth] = tag;
                }
                break;
            case 28: // RemoveObject2
                delete displayListTable[tag.Depth];
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
