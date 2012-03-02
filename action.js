var SWFAction = function(object, parentAction) {
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
	default:
	break;
	}
    }
    this.getProperty = function(num)  {
        switch (num) {
	default:
	break;
	}
    }
    this.doAction = function(tag) {
	var actions = tag.Actions;
	var actions_len = actions.length;
	var bitio = new BitIO();
	bitio.input(actions);
	while (bitio.offset() < action_len) {
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
		stack.push(actionData);
		break;
	    default:
		console.error('Unknown actionCode:'+actionCode);
		break;
	    }
	}
    }
}