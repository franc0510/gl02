var mail = function(id, date, sender, recipient, subject, cc, mimeVersion, contentType, contentTransferEncoding, bcc, xFrom, xTo, xCc, xBcc, xFolder, xOrigin, xFileName, content){
    this.id = id;
    this.date = date;
    this.sender = sender;
    this.recipient = recipient;
    this.subject = subject;
    this.cc = cc;
    this.mimeVersion = mimeVersion;
    this.contentType = contentType;
    this.contentTransferEncoding = contentTransferEncoding;
    this.bcc = bcc;
    this.xFrom = xFrom;
    this.xTo = xTo;
    this.xCc = xCc;
    this.xBcc = xBcc;
    this.xFolder = xFolder;
    this.xOrigin = xOrigin;
    this.xFileName = xFileName;
    this.content = content;
}

module.exports = mail;