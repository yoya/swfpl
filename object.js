var SWFObject = function() {
    this.framesLoaded = 0;
    var controlTags = []
    var frameToTags_idx = {};
    var controlTags_idx = 0;
    var currentFrame = 0;
    var displayListTable = {}; // depth => ...
    var playing = true;
    var labelTable;
    this.parent = this;
    this.childList = [];
    this.addChild = function(childObject) {
        childObject.parent = this;
        this.childList.push(childObject);
    }
    this.appendTag = function(tag) {
        controlTags.push(tag);
    }
    this.showFrame = function(chara, canvas) {
//        console.debug("showFrame");
//        console.debug(displayListTable);
        var depthList = [];
        for (var depth in displayListTable) {
            depthList.push(depth);
        }
        if (typeof depthList[0] === 'undefined') {
//            console.debug("depthList[0] === undefined");
            return ; // nothing to do
        }
        depthList = depthList.sort();
        canvas.clear(); // must be dirty rectangle
        for (var i = 0, n = depthList.length ; i < n ; i++) {
            var depth = depthList[i];
	    //            console.debug('depth:'+depth);
	    //            console.debug(depthList);
            var place = displayListTable[depth];
            // console.debug(place);
            var character = chara.getCharacter(place.CharacterId);
//            console.debug('character:'+place.CharacterId);
//            console.debug(character);
//            console.debug(place.Matrix);
            if (character.vectors) {
                canvas.drawVectors(character, place.Matrix, chara);
            } else {
                ;
            }
        }
    }
    this.playTick = function(chara, canvas, action, event, frameCount) {
//        console.debug("SWFObject::playTick: "+currentFrame);
        if (this.framesLoaded <= currentFrame) {
            return false; // skip
        }
        if (chara.loaded() === false) {
            return false; // skip
        }
        var actions = [];
        var done = false;
        frameToTags_idx[currentFrame] = controlTags_idx;
        if (playing === false) {
            this.showFrame(chara, canvas);            
            return true;
        }
        console.debug("SWFObject::playTick: "+currentFrame);
        do {
            var tag = controlTags[controlTags_idx++];
            switch (tag.tag_code) {
            case 0: // End
                done = true;
                break;
            case 1: // ShowFramen
//                this.showFrame(chara, canvas);
                break;
            case 12: // DoAction
                actions.push(tag);
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
                console.debug(tag);
            }
        } while (tag.tag_code > 1);
        if (done) {
            controlTags_idx = 0;
        }
        var nextFrame = null;
        for (var i = 0, n = actions.length ; i < n ; i++) {
            var ret = action.doAction(actions[i]);
            if ('nextFrame' in ret) {
                nextFrame = ret.nextFrame;
            }
        }
        // showFrame
        this.showFrame(chara, canvas);
        //
        if (nextFrame !== null) {
            currentFrame = nextFrame;
            controlTags_idx = frameToTags_idx[currentFrame];
        } else {
            currentFrame++;
            if (currentFrame >= frameCount) {
                currentFrame = 0;
                controlTags_idx = 0;
            }
        }
        if (frameCount === 1) {
            playing = false;
        }
        return true;
    }
    this.play = function() {
        playing = true;
    }
    this.stop = function() {
        playing = false;
    }
}
