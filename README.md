# rCom
rCom is a multipurpose tool to interact with emails. It parses Mime files, creates vCards (.vcf files), creates diagrams, and displays statistics.

## Files

 - [mail.js](mail.js) contains the structure of a mail object.
 - [csvEncoder.js](csvEncoder.js) contains the code that creates .csv files from objects.
 - [mimeParser.js](mimeParser.js) contains the Mime parser.
 - [rcom.js](rcom.js) contains the UI.
-  [stats.js](stats.js) contains the code that generates the statistics.
-  [vcfEncoder.js](vcfEncoder.js) contains the code that creates .vcf files (vCards) from objects.

## Installation

 - Install node js
 - Clone the repository :
 
     `git clone https://github.com/Lorenzomp/gl02.git rcom`
 
 - Change directory :
 
     `cd rcom`
 
 - Install the required modules : 
 
    `npm install colors`
 
    `npm install caporal`
 
    `npm install objects-to-csv`
 
    `npm install papaparse`
 
    `npm install readline-sync`

## Usage

`node rcom`

The UI will then explain anything you need to know

## Sources

See : [https://gitlab.com/Speedlulu/rcom](https://gitlab.com/Speedlulu/rcom)
