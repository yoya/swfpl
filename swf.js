/* Basic Structure */

    // SWF specific
var SWFRECT = function(bs) {
	bs.byteAlign();
	var Nbits = bs.getUIBits(5);
        this.Nbits = Nbits;
	this.Xmin = bs.getSIBits(Nbits);
	this.Xmax = bs.getSIBits(Nbits);
	this.Ymin = bs.getSIBits(Nbits);
	this.Ymax = bs.getSIBits(Nbits);
}

var SWFMATRIX = function(bs) {
	bs.byteAlign();
	this.HasScale = bs.getUIBit();
	if (this.HasScale) {
	    var nScaleBits = bs.getUIBits(5);
//	    this.NScaleBits = nScaleBits;
	    this.ScaleX = bs.getSIBits(nScaleBits) / 0x10000;
	    this.ScaleY = bs.getSIBits(nScaleBits) / 0x10000;
	} else {
	    this.ScaleX = 1;
	    this.ScaleY = 1;0x10000;
        }
	this.HasRotate = bs.getUIBit();
	if (this.HasRotate) {
	    var nRotateBits = bs.getUIBits(5);
//	    this.NRotateBits = nRotateBits;
	    this.RotateSkew0 = bs.getSIBits(nRotateBits) / 0x10000;
	    this.RotateSkew1 = bs.getSIBits(nRotateBits) / 0x10000;
	} else {
	    this.RotateSkew0 = 0;
	    this.RotateSkew1 = 0;
        }
	var nTranslateBits = bs.getUIBits(5);
//	this.NTranslateBits = nTranslateBits;
	this.TranslateX = bs.getSIBits(nTranslateBits);
	this.TranslateY = bs.getSIBits(nTranslateBits);
}

var SWFLANGCODE = function(bs) {
	this.LanguageCode = bs.getUI8();
}

var SWFRGB = function(bs) {
	this.Red = bs.getUI8();
	this.Green = bs.getUI8();
	this.Blue = bs.getUI8();
}


var SWFRGBA = function(bs) {
	this.Red   = bs.getUI8();
	this.Green = bs.getUI8();
	this.Blue  = bs.getUI8();
	this.Alpha = bs.getUI8();
}

var SWFARGB = function(bs) {
	this.Alpha = bs.getUI8();
	this.Red   = bs.getUI8();
	this.Green = bs.getUI8();
	this.Blue  = bs.getUI8();
}

var SWFFOCALGRADIENT = function(bs, tag_code) {
	bs.byteAlign();
	this.SpreadMode = bs.getUIBits(2);
	this.InterpolationMode = bs.getUIBits(2);
	var numGradients = bs.getUIBits(4);
	this.NumGradients = numGradients;
	var gradientRecords = [];
	for (i = 0 ; i < numGradients ; i++) {
	    gradientRecords.push(new SWFGRADRECORD(bs, tag_code));
	}
	this.GradientRecords = gradientRecords;
	this.FocalPoint = bs.getUI8();
}

var SWFGRADRECORD = function(bs, tag_code) {
    this.Ratio = bs.getUI8();
    if (tag_code < 32) { // DefineShape1or2
	this.Color = new SWFRGB(bs);
    } else { // DefineShape3
	this.Color = new SWFRGBA(bs);
    }
    this.build = function(bs) {
        bs.putUI8(this.Ratio);
        this.Color.build(bs);
    }
}

var SWFGRADIENT = function(bs, tag_code) {
	bs.byteAlign();
	this.SpreadMode = bs.getUIBits(2);
	this.InterpolationMode = bs.getUIBits(2);
	var numGradients = bs.getUIBits(4);
	this.NumGradients = numGradients;
	var gradientRecords = [];
	for (i = 0 ; i < numGradients ; i++) {
	    gradientRecords.push(new SWFGRADRECORD(bs, tag_code));
	}
	this.GradientRecords = gradientRecords;
}

var SWFFILLSTYLE = function(bs, tag_code) {
	this.FillStyleType =  bs.getUI8();
	switch (this.FillStyleType) {
	case 0x00: // solid fill
	    if (tag_code < 32) { // DefineShape1or2
		this.Color = new SWFRGB(bs);
	    } else { // DefineShape3
		this.Color = new SWFRGBA(bs);
	    }
	    break;
	case 0x10: // linear gradient fill
	case 0x12: // radial gradient fill
	    this.GradientMatrix = new SWFMATRIX(bs);
	    this.Gradient = new SWFGRADIENT(bs, tag_code);
	    break;
	case 0x13: // focal radial gradient fill
	    this.GradientMatrix = new SWFMATRIX(bs);
	    this.Gradient = new SWFFOCALGRADIENT(bs, tag_code);
	    break;
	case 0x40: // repeating bitmap fill
	case 0x41: // clipped bitmap fill
	case 0x42: // non-smoothed repeating bitmap
	case 0x43: // non-smoothed clipped bitmap
	    this.BitmapId = bs.getUI16LE();
	    this.BitmapMatrix = new SWFMATRIX(bs);
	    break;
	}
}

var SWFLINESTYLE = function(bs, tag_code) {
	this.Width = bs.getUI16LE();
	if (tag_code < 32) { // DefineShape1or2
	    this.Color = new SWFRGB(bs);
	} else { // DefineShape3
	    this.Color = new SWFRGBA(bs);
	}
}

var SWFFILLSTYLEARRAY = function(bs, tag_code) {
	var fillStyleCount = bs.getUI8();
	if ((tag_code > 2) && (fillStyleCount === 0xff)) {
	    fillStyleCount = bs.getUI16LE();
	}
	this.FillStyleCount = fillStyleCount;
	var fillStyles = [];
	for (var i = 0 ; i < fillStyleCount ; i++) {
	    fillStyles.push(new SWFFILLSTYLE(bs, tag_code));
	}
	this.FillStyles = fillStyles;
}

var SWFLINESTYLEARRAY = function(bs, tag_code) {
	var lineStyleCount = bs.getUI8();
	if ((tag_code > 2) && (lineStyleCount === 0xff)) {
	    lineStyleCount = bs.getUI16LE();
	}
	this.LineStyleCount = lineStyleCount;
	var lineStyles = [];
	for (var i = 0 ; i < lineStyleCount ; i++) {
	    lineStyles.push(new SWFLINESTYLE(bs, tag_code));
	}
	this.LineStyles = lineStyles;
}

var SWFENDSHAPERECORD = function(bs) {
    this.EndOfShape = 0;
}

var SWFSTYLECHANGERECORD = function(bs, tag_code, changeFlag, currentNumBits, currentPosition) {
    this.StateNewStyles  = (changeFlag >> 4) & 1;
    this.StateLineStyle  = (changeFlag >> 3) & 1;
    this.StateFillStyle1 = (changeFlag >> 2) & 1;
    this.StateFillStyle0 = (changeFlag >> 1) & 1;
    this.StateMoveTo     =  changeFlag       & 1;
    if (this.StateMoveTo) {
        moveBits = bs.getUIBits(5);
        this.MoveBits = moveBits;
        this.MoveX = bs.getSIBits(moveBits); // MoveDeltaX
        this.MoveY = bs.getSIBits(moveBits); // MoveDeltaY
        currentPosition.x = this.MoveX;
        currentPosition.y = this.MoveY;
    }
    if (this.StateFillStyle0) {
        this.FillStyle0 = bs.getUIBits(currentNumBits.FillBits);
    }
    if (this.StateFillStyle1) {
        this.FillStyle1 = bs.getUIBits(currentNumBits.FillBits);
    }
    ; 
    if (this.StateLineStyle) {
        this.LineStyle = bs.getUIBits(currentNumBits.LineBits);
    }
    ; 
    if (this.StateNewStyles) { // XXX tag_code;
        this.FillStyles = new SWFFILLSTYLEARRAY(bs, tag_code);
        this.LineStyles = new SWFLINESTYLEARRAY(bs, tag_code);
        var numBits = bs.getUI8();
        currentNumBits.FillBits = this.NumFillBits = numBits >> 4;
        currentNumBits.LineBits = this.NumLineBits = numBits & 0x0f;
    }
}
    
var SWFSTRAIGHTEDGERECORD = function(bs, numBits, currentPosition) {
    this.TypeFlag = 1;
    this.StraightFlag = 1;
    var deltaX, deltaY;
    this.NumBits = numBits;
    this.GeneralLineFlag = bs.getUIBit();
    if (this.GeneralLineFlag) {
        deltaX = bs.getSIBits(numBits + 2);
        deltaY = bs.getSIBits(numBits + 2);
    } else {
        this.VertLineFlag = bs.getUIBit();
        if (this.VertLineFlag) {
            deltaX = 0;
            deltaY = bs.getSIBits(numBits + 2);
        } else {
            deltaX = bs.getSIBits(numBits + 2);
            deltaY = 0;
        }
    }
    this.X = currentPosition.x + deltaX;
    this.Y = currentPosition.y + deltaY;
    currentPosition.x = this.X;
    currentPosition.y = this.Y;
}

var SWFCURVEDEDGERECORD = function(bs, numBits, currentPosition) {
    this.TypeFlag = 1;
    this.StraightFlag = 0;
    this.NumBits = numBits;
    var controlDeltaX = bs.getSIBits(numBits + 2);
    var controlDeltaY = bs.getSIBits(numBits + 2);
    var anchorDeltaX = bs.getSIBits(numBits + 2);
    var anchorDeltaY = bs.getSIBits(numBits + 2);
    this.ControlX = currentPosition.x + controlDeltaX;
    this.ControlY = currentPosition.y + controlDeltaY;
    this.AnchorX = this.ControlX + anchorDeltaX;
    this.AnchorY = this.ControlY + anchorDeltaY;
    currentPosition.x = this.AnchorX;
    currentPosition.y = this.AnchorY;
}

var SWFSHAPERECORDS = function() { // SHAPEs
    this.parseRecords = function(bs, tag_code, currentNumBits) {
        var shapeRecords = [];
        var done = false;
        var currentPosition = {x:0, y:0};
        while (done === false) {
            var first6Bits = bs.getUIBits(6);
            if (first6Bits & 0x20) { // Edge
                var numBits = first6Bits & 0x0f;
                if (first6Bits & 0x10) { // StraigtEdge (11XXXX)
                    var shape = new SWFSTRAIGHTEDGERECORD(bs, numBits, currentPosition);
                } else { // CurvedEdge (10XXXX)
                    var shape = new SWFCURVEDEDGERECORD(bs, numBits, currentPosition);
                }
            } else if (first6Bits) { // ChangeStyle (0XXXXX)
                var changeFlag = first6Bits;
                var shape = new SWFSTYLECHANGERECORD(bs, tag_code, changeFlag, currentNumBits, currentPosition);
            } else { // EndOfShape (000000)
                var shape = new SWFENDSHAPERECORD(bs);
            }
            shapeRecords.push(shape);
            if (shape instanceof SWFENDSHAPERECORD) {
                done = true;
            }
        }
       return shapeRecords;
    }
}

var SWFSHAPE = function(bs, tag_code) {
	var numBits = bs.getUI8();
	this.NumFillBits = numBits >> 4;
	this.NumLineBits = numBits & 0x0f;
	var currentNumBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
        var shapes = new SWFSHAPERECORDS();
        this.ShapeRecords = shapes.parseRecords(bs, tag_code, currentNumBits);
}

var SWFSHAPEWITHSTYLE = function(bs, tag_code, currentNumBits) {
	this.FillStyles = new SWFFILLSTYLEARRAY(bs, tag_code);
	this.LineStyles = new SWFLINESTYLEARRAY(bs, tag_code);
	var numBits = bs.getUI8();
	this.NumFillBits = numBits >> 4;
	this.NumLineBits = numBits & 0x0f;
	var currentNumBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
        var shapes = new SWFSHAPERECORDS();
        this.ShapeRecords = shapes.parseRecords(bs, tag_code, currentNumBits);
}

var SWFCXFORM = function(bs) {
    bs.byteAlign();
    var first6bits = bs.getUIBits(6);
    this.HasAddTerms = first6bits >> 5;
    this.HasMultiTerms = (first6bits >> 4) & 1;
    var nbits = first6bits & 0x0f;
    this.Nbits = nbits;
    if (this.HasMultiTerms) {
        this.RedMultiTerm = bs.getSIBits(nbits);
        this.GreenMultiTerm = bs.getSIBits(nbits);
        this.BlueMultiTerm = bs.getSIBits(nbits);
    }
    if (this.HasAddTerms) {
        this.RedAddTerm = bs.getSIBits(nbits);
        this.GreenAddTerm = bs.getSIBits(nbits);
        this.BlueAddTerm = bs.getSIBits(nbits);
    }
}

var SWFCXFORMWITHALPHA = function(bs) {
    bs.byteAlign();
    var first6bits = bs.getUIBits(6);
    this.HasAddTerms = first6bits >> 5;
    this.HasMultiTerms = (first6bits >> 4) & 1;
    var nbits = first6bits & 0x0f;
    this.Nbits = nbits;
    if (this.HasMultiTerms) {
        this.RedMultiTerm = bs.getSIBits(nbits);
        this.GreenMultiTerm = bs.getSIBits(nbits);
        this.BlueMultiTerm = bs.getSIBits(nbits);
        this.AlphaMultiTerm = bs.getSIBits(nbits);
    }
    if (this.HasAddTerms) {
        this.RedAddTerm = bs.getSIBits(nbits);
        this.GreenAddTerm = bs.getSIBits(nbits);
        this.BlueAddTerm = bs.getSIBits(nbits);
        this.AlphaAddTerm = bs.getSIBits(nbits);
    }
}

var SWFCLIPEVENTFLAGS = function(bs) {
    if (bs) {
        ;
    }
}

var SWFCLIPACTIONRECORD = function(bs) {
    if (bs) {
        ;
    }
}

var SWFCLIPACTIONS = function(bs) {
    this.Reserved = bs.getUI16LE(); 
    this.AllEventFlags = new SWFCLIPEVENTFLAGS(bs);
    var clipActionRecords = [];
    while (true) {
        clipActionRecord = new SWFCLIPACTIONRECORD(bs);
        clipActionRecords.push(clipActionRecord);
        if (true) { // condition end of clipactionrecords
            break;
        }
    }
    this.ClipActionRecords = clipActionRecords; 
    this.FrameRate  = bs.getUI16LE(); // XXX getUI32LE if SWFv6 over
}

/* Tag */

var SWFEnd = function(bs, tag_code, length) { // code:0
    if (bs) {
        this.tag_code = tag_code;
        this.tag_length =  length;
    }
}

var SWFShowFrame = function(bs, tag_code, length) { // code:1
    if (bs) {
        this.tag_code = tag_code;
        this.tag_length =  length;
    }
}

var SWFDefineShape = function(bs, tag_code, length) { // 2,22,32
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.ShapeId = bs.getUI16LE();
	this.ShapeBounds = new SWFRECT(bs);
	this.Shapes = new SWFSHAPEWITHSTYLE(bs, tag_code);
}

var SWFPlaceObject = function(bs, tag_code, length) { // code:4, 26
    this.tag_code = tag_code;
    this.tag_length =  length;
    if (tag_code === 4) { // PlaceObject
        var byteOffset = bs.byte_offset;
        this.CharacterId = bs.getUI16LE();
        this.Depth = bs.getUI16LE();
        this.Matrix = new SWFMATRIX(bs);
        if (byteOffset + length < bs.byte_offset) {
            this.Colortransform = new SWFCXFORM(bs);
        }
    } else { // PlaceObject2
        var placeFlag = bs.getUI8();
        this.PlaceFlagHasClipActions = (placeFlag >> 7) & 0x01
        this.PlaceFlagHasClipDepth   = (placeFlag >> 6) & 0x01
        this.PlaceFlagHasName        = (placeFlag >> 5) & 0x01
        this.PlaceFlagHasRatio       = (placeFlag >> 4) & 0x01
        this.PlaceFlagHasColorTransform = (placeFlag >> 3) & 0x01
        this.PlaceFlagHasMatrix      = (placeFlag >> 2) & 0x01
        this.PlaceFlagHasCharacter   = (placeFlag >> 1) & 0x01;
        this.PlaceFlagHasMove        =  placeFlag       & 0x01;
        this.Depth = bs.getUI16LE();
        if (this.PlaceFlagHasCharacter) {
            this.CharacterId = bs.getUI16LE();
        }
        if (this.PlaceFlagHasMatrix) {
            this.Matrix = new SWFMATRIX(bs);
        }
        if (this.PlaceFlagHasColorTransform) {
            this.Colortransform = new SWFCXFORMWITHALPHA(bs);
        }
        if (this.PlaceFlagHasRatio) {
            this.Ratio = bs.getUI16LE();
        }
        if (this.PlaceFlagHasName) {
            this.Name = bs.getDataUntil("\0");
        }
        if (this.PlaceFlagHasClipDepth) {
            this.ClipDepth = bs.getUI16LE();
        }
        if (this.PlaceFlagHasClipActions) {
            this.ClipActions = new SWFCLIPACTIONS(bs);
        }
    }
}

var SWFRemoveObject = function(bs, tag_code, length) { // 5, 28
    this.tag_code = tag_code;
    this.tag_length =  length;
    if (tag_code === 5) { // RemoveObject
        this.CharacterId = bs.getUI16LE();
        this.Depth = bs.getUI16LE();
    } else { // RemoveObject2
        this.Depth = bs.getUI16LE();
    }
}

var SWFDefineBitsJPEG = function(bs, tag_code, length) { // code:6, 21, 35
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.CharacterID = bs.getUI16LE();
    var imageDataLen = length - 2;
    if (tag_code === 35) { // DefineBitsJPEG3
        this.AlphaDataOffset = bs.getUI32LE();
        imageDataLen = this.AlphaDataOffset;
    }
    this.ImageData = bs.getData(imageDataLen);
    if (tag_code === 35) { // DefineBitsJPEG3
        this.BitmapAlphaData = bs.getData(length - 2 - imageDataLen);
    }
}

var SWFJPEGTables = function(bs, tag_code, length) { // code:8
    this.tag_code = tag_code;
    this.tag_length =  length;
    var imageDataLen = length;
    this.JPEGData = bs.getData(length);
}

var SWFSetBackgroundColor = function(bs, tag_code, length) { // code:9
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.BackgroundColor = new SWFRGB(bs);
}

var SWFDefineFont = function(bs, tag_code, length) { // code:10,48
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.FontID = bs.getUI16LE();
    if (tag_code == 10) { // DefineFont
        var numGlyphs = bs.getUI16LE(); // ???
        this.NumGlyphs = numGlyphs; // ???
        var offsetTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            offsetTable.push(bs.getUI16LE());
        }
        this.OffsetTable = offsetTable;
        var glyphShapeTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            glyphShapeTable.push(new SWFSHAPE(bs, tag_code));
        }
        this.GlyphShapeTable = glyphShapeTable;
    } else { // 48: DefineFont2
        var fontFlags = bs.getUI8();
        this.FontFlagsHasLayout   = (fontFlags >>> 7) & 1;
        this.FontFlagsShiftJIS    = (fontFlags >>> 6) & 1;
        this.FontFlagsSmallText   = (fontFlags >>> 5) & 1;
        this.FontFlagsANSI        = (fontFlags >>> 4) & 1;
        this.FontFlagsWideOffsets = (fontFlags >>> 3) & 1;
        this.FontFlagsWideCodes   = (fontFlags >>> 2) & 1;
        this.FontFlagsItalic      = (fontFlags >>> 1) & 1;
        this.FontFlagsBold        = (fontFlags      ) & 1;
        this.LanguageCode = new SWFLANGCODE(bs, tag_code);
        this.FontNameLen = bs.getUI8();
        if (this.FontNameLen) {
            this.FontName = bs.getData(this.FontNameLen);
        }
        var numGlyphs = bs.getUI16LE();
        this.NumGlyphs = numGlyphs;
        if (numGlyphs === 0) {
            return ; // no glyphs field.
        }
        var offsetTable = [];
        if (this.FontFlagsWideOffsets) {
            for (var i = 0 ; i < numGlyphs ; i++) {
                offsetTable.push(bs.getUI32LE());
            }
            this.OffsetTable = offsetTable;
            this.CodeTableOffset = bs.getUI32LE();
        } else {
            for (var i = 0 ; i < numGlyphs ; i++) {
                offsetTable.push(bs.getUI16LE());
            }
            this.OffsetTable = offsetTable;
            this.CodeTableOffset = bs.getUI16LE();
        }
        var glyphShapeTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            glyphShapeTable.push(new SWFSHAPE(bs, tag_code));
        }
        this.GlyphShapeTable = glyphShapeTable;
        var codeTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            codeTable.push(bs.getUI16LE());
        }
        this.CodeTable = codeTable;
        if (this.FontFlagsHasLayout) {
            this.FontAscent = bs.getUI16LE();
            this.FontDescent = bs.getUI16LE();
            this.FontLeading = bs.getUI16LE();
            var fontAdvanceTable = [];
            for (var i = 0 ; i < numGlyphs ; i++) {
                fontAdvanceTable.push(bs.getUI16LE());
            }
            this.FontAdvanceTable = fontAdvanceTable;
            var fontBoundsTable = [];
            for (var i = 0 ; i < numGlyphs ; i++) {
                fontBoundsTable.push(new SWFRECT(bs));
            }
            this.FontBoundsTable = fontBoundsTable;
        }
    }
}

var SWFDefineFontName = function(bs, tag_code, length) { // code:48
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.FontID = bs.getUI16LE();
    this.FontName = bs.getDataUntil("\0"); // STRING
    this.FontCopyright = bs.getDataUntil("\0"); // STRING
}

var SWFDoAction = function(bs, tag_code, length) { // code:12
    this.tag_code = tag_code;
    this.tag_length =  length;
    this.Actions = bs.getData(length - 1);
    this.ActionEndFlag = bs.getUI8();
}

var SWFDefineBitsLossless = function(bs, tag_code, length) { // code:20,36
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.CharacterID = bs.getUI16LE();
	this.BitmapFormat = bs.getUI8();
	this.BitmapWidth = bs.getUI16LE();
	this.BitmapHeight = bs.getUI16LE();
    var zlibBitmapDataLen = length - 7;
    if (this.BitmapFormat === 3) {
        this.BitmapColorTableSize = bs.getUI8() + 1;
        zlibBitmapDataLen--;
    }
    this.ZlibBitmapData = bs.getData(zlibBitmapDataLen);
}

var SWFProtect = function(bs, tag_code, length) { // code:24
    this.tag_code = tag_code;
    this.tag_length =  length;
}

var SWFDefineEditText = function(bs, tag_code, length) { // code:37
    this.tag_code = tag_code;
    this.tag_length =  length;
    this.CharacterID = bs.getUI16LE();
    this.Bound = SWFRECT(bs);
    var flag1 = bs.getUI8();
    this.HasText      = (flag1 >>> 7) & 1;
    this.WordWrap     = (flag1 >>> 6) & 1;
    this.Multiline    = (flag1 >>> 5) & 1;
    this.Password     = (flag1 >>> 4) & 1;
    this.ReadOnly     = (flag1 >>> 3) & 1;
    this.HasTextColor = (flag1 >>> 2) & 1;
    this.HasMaxLength = (flag1 >>> 1) & 1;
    this.HasFont      =  flag1        & 1;
    var flag2 = bs.getUI8();
    this.HasFontClass = (flag2 >>> 7) & 1;
    this.AutoSize     = (flag2 >>> 6) & 1;
    this.HasLayout    = (flag2 >>> 5) & 1;
    this.NoSelect     = (flag2 >>> 4) & 1;
    this.Border       = (flag2 >>> 3) & 1;
    this.WasStatic    = (flag2 >>> 2) & 1;
    this.HTML         = (flag2 >>> 1) & 1;
    this.UseOutlines  =  flag2        & 1;
    if (this.HasFont) {
        this.FontID = bs.getUI16LE();
        if (this.HasFontClass) { // can't be true if hasFont is true
            this.FontClass = bs.getDataUntil("\0"); // STRING
        }
        this.FontHeight = bs.getUI16LE();
    }
    if (this.HasTextColor) {
        this.TextColor = new SWFRGBA(bs);
    }
    if (this.HasMaxLength) {
        this.MaxLength = bs.getUI16LE();
    }
    if (this.HasLayout) {
        this.Align = bs.getUI8();
        this.LeftMargin = bs.getUI16LE();
        this.RightMargin = bs.getUI16LE();
        this.Indent = bs.getUI16LE();
        this.Leading = bs.getUI16LE();
    }
    this.VariableName = bs.getDataUntil("\0"); // STRING
    if (this.HasText) {
        this.InitialText = bs.getDataUntil("\0"); // STRING
    }
}

var SWFDefineSprite = function(bs, tag_code, length) { // code:39
    var parser = new SWFParser(null);
    this.tag_code = tag_code;
    this.tag_length =  length;
    this.SpriteID = bs.getUI16LE();
    this.FrameCount = bs.getUI16LE();
    this.ControlTags = parser.parseTags(bs);
}

var SWFFrameLabel = function(bs, tag_code, length) { // code:43
    this.tag_code = tag_code;
    this.tag_length = length;
    this.Name = bs.getDataUntil("\0");
}

var SWFDefineMorphShape = function(bs, tag_code, length) { // 46
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.CharacterId = bs.getUI16LE();
	this.StartBounds = new SWFRECT(bs);
	this.EndBounds = new SWFRECT(bs);
    var offsetOfOffset = bs.getOffset();
	this.Offset = bs.getUI32LE();
    this.MorphFillStyles = new SWFMORPHFILLSTYLEARRAY(bs, tag_code);
    this.MorphLineStyles = new SWFMORPHLINESTYLEARRAY(bs, tag_code);
	this.StartEdges = new SWFSHAPE(bs, tag_code);
    var offsetOfEndEdges = bs.getOffset();
    if (offsetOfEndEdges.byte_offset != offsetOfOffset.byte_offset + this.Offset + 4) {
        console.warn("DefineMorphShape CharacterId("+ this.CharacterId+"): offsetOfEndEdges.byte_offset("+offsetOfEndEdges.byte_offset+") != offsetOfOffset.byte_offset("+offsetOfOffset.byte_offset+") + this.Offset("+this.Offset+") + 4");
        bs.setOffset(offsetOfOffset.byte_offset + this.Offset + 4, 0);
    }
	this.EndEdges = new SWFSHAPE(bs, tag_code);
}

var SWFMORPHFILLSTYLE = function(bs, tag_code) {
	this.FillStyleType =  bs.getUI8();
	switch (this.FillStyleType) {
	  case 0x00: // solid fill
        this.StartColor = new SWFRGBA(bs);
        this.EndColor = new SWFRGBA(bs);
	    break;
	  case 0x10: // linear gradient fill
	  case 0x12: // radial gradient fill
	    this.StartGradientMatrix = new SWFMATRIX(bs);
	    this.EndGradientMatrix = new SWFMATRIX(bs);
	    this.Gradient = new SWFMORPHGRADIENT(bs, tag_code);
	    break;
	  case 0x13: // focal radial gradient fill
	    this.StartGradientMatrix = new SWFMATRIX(bs);
	    this.EndGradientMatrix = new SWFMATRIX(bs);
	    this.Gradient = new SWFFOCALGRADIENT(bs, tag_code);
	    break;
	  case 0x40: // repeating bitmap fill
	  case 0x41: // clipped bitmap fill
	  case 0x42: // non-smoothed repeating bitmap
	  case 0x43: // non-smoothed clipped bitmap
	    this.BitmapId = bs.getUI16LE();
	    this.StartBitmapMatrix = new SWFMATRIX(bs);
	    this.EndBitmapMatrix = new SWFMATRIX(bs);
	    break;
	}
}

var SWFMORPHGRADIENT = function(bs, tag_code) {
	var numGradients = bs.getUI8();
	this.NumGradients = numGradients;
	var gradientRecords = [];
	for (i = 0 ; i < numGradients ; i++) {
	    gradientRecords.push(new SWFMORPHGRADRECORD(bs, tag_code));
	}
	this.GradientRecords = gradientRecords;
}

var SWFMORPHGRADRECORD = function(bs, tag_code) {
    this.StartRatio = bs.getUI8();
    this.StartColor = new SWFRGBA(bs);
    this.EndRatio = bs.getUI8();
    this.EndColor = new SWFRGBA(bs);
}

var SWFMORPHLINESTYLE = function(bs, tag_code) {
    this.StartWidth = bs.getUI16LE();
    this.EndWidth = bs.getUI16LE();
    this.StartColor = new SWFRGBA(bs);
    this.EndColor = new SWFRGBA(bs);
}

var SWFMORPHFILLSTYLEARRAY = function(bs, tag_code) {
	var fillStyleCount = bs.getUI8();
	if (fillStyleCount === 0xff) {
	    fillStyleCount = bs.getUI16LE();
	}
	this.FillStyleCount = fillStyleCount;
	var fillStyles = [];
	for (var i = 0 ; i < fillStyleCount ; i++) {
	    fillStyles.push(new SWFMORPHFILLSTYLE(bs, tag_code));
	}
	this.FillStyles = fillStyles;
}

var SWFMORPHLINESTYLEARRAY = function(bs, tag_code) {
	var lineStyleCount = bs.getUI8();
	if (lineStyleCount === 0xff) {
	    lineStyleCount = bs.getUI16LE();
	}
	this.LineStyleCount = lineStyleCount;
	var lineStyles = [];
	for (var i = 0 ; i < lineStyleCount ; i++) {
	    lineStyles.push(new SWFMORPHLINESTYLE(bs, tag_code));
	}
	this.LineStyles = lineStyles;
}

var SWFUnknownTag = function(bs, tag_code, length) { // code:etc
    this.tag_code = tag_code;
    this.tag_length =  length;
	this.data = bs.getData(length);
}
