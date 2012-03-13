var SWFAction = function(object, parentAction) {
    console.debug("SWFAction");
    var variables = {};
    var stack = [];
    this.setVariable = function(name, value)  {
	variables[name] = value;
    }
    this.getVariable = function(name)  {
	if (name in variables) {
	    return variables[name];
	} else {
	    return null;
	}
    }
    this.setProperty = function(num, value)  {
        switch (num) {
        case 0: // _X
        break;
	default:
	break;
	}
    }
    this.getProperty = function(num)  {
        switch (num) {
        case 0: // _X
        break;
	default:
        break;
	}
    }
    this.doAction = function(tag) {
	var actions = tag.Actions;
	var actions_len = actions.length;
	var bitio = new BitIO();
	bitio.input(actions);
        var ret = {};
	while (bitio.getOffset().byte_offset < actions_len) {
	    var actionCode = bitio.getUI8();
	    var actionData = null;
	    console.debug('actionCode:'+actionCode);
	    if (actionCode & 0x80) {
		var actionLength = bitio.getUI16LE();
		actionData = bitio.getData(actionLength);
	    }
	    switch (actionCode) {
	    case 0x06: // Play
		object.play();
		break;
	    case 0x07: // Stop
		object.stop();
		break;
	    case 0x1d: // SetVariables
		variables[stack.pop()] = stack.pop();
		break;
	    case 0x81: // GotoFrame
                ret.nextFrame = bitio.toUI16LE(actionData);
		break;
	    case 0x83: // GetURL
		var params = actionData.split("\0");
		var urlString = params[0];
		var trgetString = params[1];
		// GetURL Procedure
		console.error('not implemented yet. code:'+actionCode);
		break;
	    case 0x8c: // GoToLabel
		object.gotoLabel(actionData);
		break;
	    case 0x96: // Push
		var bitio2 = new BitIO();
		bitio2.input(actionData);
		while (bitio2.getOffset().byte_offset < actionLength) {
		    var v = null;
		    switch (bitio2.getUI8()) {
		    case 0: // string literal
			v = bitio2.getDataUntil("\0");
			break;
		    case 1: // : floating-point literal
			console.error('not imlemented yet. float');
			v = bitio2.getData(4); // dummy;
		    }
		    stack.push(v);
		}
		break;
	    case 0x99: // Jump
		var branchOffset = bitio.toSI16LE(actionData);
		bitio.incrementOffset(branchOffset, 0);
		break;
	    case 0x9d: // If
		if (stack.pop()) {
		    var branchOffset = bitio.toSI16LE(actionData);
		    bitio.incrementOffset(branchOffset, 0);
		}
		break;
	    default:
		console.error('Unknown actionCode:'+actionCode);
		break;
	    }
	}
        return ret;
    }
}