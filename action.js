var SWFAction = function(object, parentAction) {
    var variables = {};
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
	;
    }
}