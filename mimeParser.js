var mail = require("./mail");

var mimeParser = function(sTokenize, sParsedSymb, errors){
	// The list of POI parsed from the input file.
	this.parsedMail = [];
	this.symb = ["Message-ID", "Date", "From", "To", "Subject", "Cc", "Mime-Version", "Content-Type", "Content-Transfer-Encoding", "Bcc", "X-From", "X-To", "X-cc", "X-bcc", "X-Folder", "X-Origin", "X-Filename"];
    this.crashed = false;
    this.showTokenize = sTokenize;
    this.showParsedSymbols = sParsedSymb;
    this.logErrors = errors;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
mimeParser.prototype.tokenize = function(data){
	var separator = /(\r\n|: |\n|\r|\n\r)/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
mimeParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
    }
    try {
        this.mail(tData);
    }
    catch(err)
    {
        if (this.logErrors) console.log('File crashed the parser : ' + err);
        this.crashed = true;
    }
}

// Parser operand

mimeParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	if (this.logErrors) console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
mimeParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
mimeParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}

// check : check whether the arg elt is on the head of the list
mimeParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
mimeParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}

//Parser rules

//<mail> = <ID> <eol> <date> <eol> <sender> <eol> [<recipient> <eol>] <subject> <eol> <mimeVersion> <eol> <contentType> <eol> <contentTransferEncoding> <eol> 
//[<bcc> <eol>] <xFrom> <eol> <xTo> <eol> <xCc> <eol> <xBcc> <eol> <xFolder> <eol> <xOrigin> <eol> <xFileName> <eol> <content> 
mimeParser.prototype.mail = function(input){
    var id = this.id(input);
    var date = this.date(input);
    var sender = this.sender(input);
    var recipient = [];
    if (this.check("To",input)) recipient = this.recipient(input);
    var subject = this.subject(input);
    var cc = [];
    if (this.check("Cc", input)) cc = this.cc(input);
    var mimeVersion = this.mimeVersion(input);
    var contentType = this.contentType(input);
    var contentTransferEncoding = this.contentTransferEncoding(input);
    var bcc = [];
    if (this.check("Bcc", input)) bcc = this.bcc(input);
    var xFrom = this.xFrom(input);
    var xTo = this.xTo(input);
    var xCc = this.xCc(input);
    var xBcc = this.xBcc(input);
    var xFolder = this.xFolder(input);
    var xOrigin = this.xOrigin(input);
    var xFileName = this.xFileName(input);
    var content = input.join('\n');
    this.parsedMail.push(new mail(id, date, sender, recipient, subject, cc, mimeVersion, contentType, contentTransferEncoding, bcc, xFrom, xTo, xCc, xBcc, xFolder, xOrigin, xFileName, content));
}

//<ID> = "Message-ID: " "<" *ALPHA "." *ALPHA "." *ALPHA "." *ALPHA "@" *ALPHA "">"
mimeParser.prototype.id = function(input){
    this.expect("Message-ID", input);
    var curS = this.next(input);
    if (curS[0] != "<" || curS[curS.length-1] != ">") this.errMsg("Invalid id", curS); //checks if there < or > at both ends
    var sliced = curS.slice(1,-1); //gets rid of < and >
    if (sliced.split('.').length != 4) this.errMsg("Invalid id", curS); //checks if the id is in four parts divided by a .
    if (sliced.split('.')[3].split("@").length != 2) this.errMsg("Invalid id", curS); //check if the last part is composed of two parts divided by a @
    return curS;
}

//<date> = "Date: " "Mon, "|"Tue, "|"Wed, "|"Thu, "|"Fri, "|"Sat, "|"Sun, " ("0"|"1"|"2" DIGIT)|("30")|("31") WSP "Jan"|"Feb"|"Mar"|"Apr"|"May"|"Jun"|"Jul"|"Aug"|"Sep"|"Oct"|"Nov"|"Dec" WSP 4DIGIT WSP (("0"|"1" DIGIT | ("2" ("0"|"1"|"2"|"3")) ":" ("0"|"1"|"2"|"3"|"4"|"5") DIGIT ":" ("0"|"1"|"2"|"3"|"4"|"5") DIGIT WSP "-"|"+" 4DIGIT WSP "(" 3ALPHA ")"
mimeParser.prototype.date = function(input){
    this.expect("Date",input);
    var curS = this.next(input);
    var split = curS.split(" ");
    if (!split[0].match(/Mon,|Tue,|Wed,|Thu,|Fri,|Sat,|Sun,/)) this.errMsg("Invalid date (week day)", curS); //checks if day of the week is in correct format
    if (!split[1].match(/\d|[1|2]\d|30|31/)) this.errMsg("Invalid date (month day)", curS); //check if day of the month is in correct format
    if (!split[2].match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)) this.errMsg("Invalid date (month)", curS); //check if month is in correct format
    if (split[3].length != 4) this.errMsg("Invalid date (year)", curS); //checks if year is in correct format
    if (!split[4].match(/([0|1]\d|2[0|1|2|3]):([0|1|2|3|4|5|]\d):([0|1|2|3|4|5|]\d)/)) this.errMsg("Invalid date (time)", curS); //checks if time is in correct format
    if (split[5].length != 5 || !split[5][0].match(/\+|-/)) this.errMsg("Invalid date (time code)", curS);
    if (split[6].length != 5 || split[6][0] != '(' || split[6][4] != ')') this.errMsg("Invalid date (time zone)", curS);

    return curS;   
}

//<sender> = emailAddress
mimeParser.prototype.sender = function(input){
    this.expect("From", input);
    var curS = this.next(input);
    if (this.isEmail(curS)) return curS;
    this.errMsg("Invalid sender", curS); 
}

//<recipient> = *<emailAddress>
mimeParser.prototype.recipient = function(input){
    this.expect("To", input);
    var curS = this.next(input);
    var recipients = [];
    while (curS != "Subject")
    {
        curS = curS.trim();
        if (curS.endsWith(',')) curS = curS.slice(0,-1); //dirty workaround
        curS = curS.split(", ");
        for (var i = 0; i < curS.length; i++)
        {
            if (this.isEmail(curS[i])) recipients.push(curS[i]);
            else this.errMsg("Invalid Cc", curS[i]);
        }
        curS = this.next(input);
    }
    input.unshift(curS); //X-From was shifted 
    return recipients;
}


//<emailAddress> = *ALPHA "@" *ALPHA "." (2ALPHA|3ALPHA)
mimeParser.prototype.isEmail = function(input){
    if (input.split("@").length != 2) {
        this.errMsg("Invalid email address (arobase)", input);
        return false; //check for arobase
    }
    if (input.split("@")[1].split(".").length < 2) {
        this.errMsg('Invalid email address (domain name)', input);
        return false; //check for domain name
    }
    if (! (input.split("@")[1].split(".")[input.split("@")[1].split(".").length-1].length == 3 || input.split("@")[1].split(".")[input.split("@")[1].split(".").length-1].length == 2)) {
        this.errMsg('Invalid email address (top level domain)', input);
        return false; //check for top level domain
    }
    return true;
}

//<subject> = *CHAR HAVE TO TAKE CARE OF CASE WHERE ": " IS PRESENT IN SUBJECT (done)
mimeParser.prototype.subject = function(input){
    this.expect("Subject", input);
    var curS = this.next(input);
    var subject = ""
    while (curS != "Mime-Version" && curS != "Cc"){
        subject += curS;
        curS = this.next(input);
    }
    input.unshift(curS); //because Mime-Version or Cc was shifted
    return subject;
}

//<Cc> = *<emailAddress>
mimeParser.prototype.cc = function(input){
    this.expect("Cc", input);
    var curS = this.next(input);
    var cc = [];
    while (curS != "Mime-Version")
    {
        curS = curS.trim();
        if (curS.endsWith(',')) curS = curS.slice(0,-1); //dirty workaround
        curS = curS.split(", ");
        for (var i = 0; i < curS.length; i++)
        {
            if (this.isEmail(curS[i])) cc.push(curS[i]);
            else this.errMsg("Invalid Cc", curS[i]);
        }
        curS = this.next(input);
    }
    input.unshift(curS); 
    return cc;
}

//<mimeVersion> = *CHAR
mimeParser.prototype.mimeVersion = function(input){
    this.expect("Mime-Version", input);
    return this.next(input);
}

//<contentType> = *CHAR
mimeParser.prototype.contentType = function(input){
    this.expect("Content-Type", input);
    return this.next(input);
}

//<contentTransferEncoding> = *CHAR
mimeParser.prototype.contentTransferEncoding = function(input){
    this.expect("Content-Transfer-Encoding", input);
    return this.next(input);
}

//<bcc> = *<emailAddress>
mimeParser.prototype.bcc = function(input){
    this.expect("Bcc", input);
    var curS = this.next(input);
    var bcc = [];
    while (curS != "X-From")
    {
        curS = curS.trim();
        if (curS.endsWith(',')) curS = curS.slice(0,-1); //dirty workaround
        curS = curS.split(", ");
        for (var i = 0; i < curS.length; i++)
        {
            if (this.isEmail(curS[i])) bcc.push(curS[i]);
            else this.errMsg("Invalid Bcc", curS[i]);
        }
        curS = this.next(input);
    }
    input.unshift("X-From"); //X-From was shifted 
    return bcc;
}

//<xFrom> = *CHAR
mimeParser.prototype.xFrom = function(input){
    this.expect("X-From", input);
    return this.next(input);
}

//<xTo> = *CHAR
mimeParser.prototype.xTo = function(input){
    this.expect("X-To", input);
    return this.next(input);
}

//<xCc> = [*CHAR]
mimeParser.prototype.xCc = function(input){
    this.expect("X-cc", input);
    var next = this.next(input);
    if (next == "X-bcc") return "";
    return next;
}

//<xBcc> = [*CHAR]
mimeParser.prototype.xBcc = function(input){
    this.expect("X-bcc", input);
    var next = this.next(input);
    if (next == "X-Folder") return "";
    return next;
}

//<xFolder> = *("\"*ALPHA)
mimeParser.prototype.xFolder = function(input){
    this.expect("X-Folder", input);
    var folder = this.next(input);
    if (!folder.match(/\\/)) this.errMsg("Invalid X-Folder", folder);
    return folder;
}

//<xOrigin> = *CHAR 
mimeParser.prototype.xOrigin = function(input){
    this.expect("X-Origin", input);
    return this.next(input);
}

//<xFileName> = *CHAR ".pst"
mimeParser.prototype.xFileName = function(input){
    this.expect('X-FileName', input);
    var filename = this.next(input);
    if (filename.split('.').length == 2 || filename.split('.')[1] == "pst") return filename;
    this.errMsg("Invalid X-Filename", filename)
}

module.exports = mimeParser;