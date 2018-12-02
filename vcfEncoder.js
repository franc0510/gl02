var fs = require('fs');

var vcfEncoder = function() {
    this.vcfData = "BEGIN:VCARD\r\nVERSION:4.0\r\n";
};

vcfEncoder.prototype.createVcard = function (data) {
    var nameToBeTreated = data.xFrom;
    while(nameToBeTreated.includes('"')) nameToBeTreated = nameToBeTreated.replace('"', "");
    while(nameToBeTreated.includes("'")) nameToBeTreated = nameToBeTreated.replace("'", "");
    nameToBeTreated = nameToBeTreated.split(/, | /);
    var nameTreated = nameToBeTreated.filter(function(string){return ! string.startsWith("<")});
    this.vcfData = this.vcfData + "N:" + nameTreated[0] + ";"+ nameTreated[1] + "\r\n";
    this.vcfData = this.vcfData + "FN:" + nameTreated[1] + " " + nameTreated[0]  + "\r\n";
    this.vcfData = this.vcfData + "EMAIL:" + data.sender + "\r\n";
    this.vcfData = this.vcfData + "END:VCARD";
}

module.exports = vcfEncoder;