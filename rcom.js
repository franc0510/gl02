var fs = require('fs');
var colors = require('colors');

var mimeParser = require('./mimeParser.js');
var vcfEncoder = require('./vcfEncoder.js');
var csvEncoder = require('./csvEncoder.js');
var s = require('./stats.js');

// Before starting : npm install objects-to-csv
const ObjectsToCsv = require('objects-to-csv');
var datatable = [];

var cli = require('caporal');

cli
    .version('0.01')


    // check Mime
	.command('check', 'Check if [files...] are valid Mime files')
	.argument('[files...]', 'Files to check with Mime parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', cli.BOOL, false)
	.option('-t, --showTokenize', 'log the tokenization results', cli.BOOL, false)
	.option('-e, --errors', 'log errors', cli.BOOL, false)
	.action(function(args, options, logger){
		args.files.forEach(function(file){
			fs.readFile(file, 'utf8', function (err,data) {
				if (err) {
					logger.info("Error while reading file : ".red + file + " : ".red + err);
				}
				else {
					var analyzer = new mimeParser(options.showTokenize, options.showSymbols, options.errors);
					analyzer.parse(data);
					
					if(analyzer.errorCount === 0){
						if (analyzer.crashed) looger.info(file.red + " file crashed the parser".red);
						else logger.info(file.green + " file is a valid Mime file".green);
					}
					else {
						if (analyzer.crashed) logger.info(file.red + " file encountered ".red + analyzer.errorCount + " errors before crashing the parser".red);
						else logger.info(file.red + " file contains ".red + analyzer.errorCount + " error(s)".red);
					}
					
					logger.debug(analyzer.parsedMail);
				}
			});
		})	
	})

	// encode Mime to .vcf, creates an intermediary .json file doesn't make sense now
	.command('encode', 'Encode Mime [files...] to vcf format')
	.argument('[files...]', 'The [files...] to encode')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', cli.BOOL, false)
	.option('-t, --showTokenize', 'log the tokenization results', cli.BOOL, false)
	.option('-e, --errors', 'log errors', cli.BOOL, false)
	.option('-d --destination', 'where to put the .vcf files')
	.option('-j --json', 'create intermediary json file', cli.BOOL, false)
	.action(function(args, options, logger){
		if (options.destination == false) var destination = "./";
		else var destination = options.destination;
		if (! destination.endsWith("/")) destination = destination + "/";
		if (destination != "./") fs.mkdir(destination, {recursive: true}, function(data,err){
			if (err) return logger.warn("Couldn't create destination folder : " + destination +", aborting : ".red + err);
			else {
				logger.info("Destination directory created : ".green + destination);
			}
		});
		args.files.forEach(function(file){
			fs.readFile(file, 'utf8', function (err,data) {
				if (err) {
					logger.info("Error while reading file : ".red + file + " : ".red + err);
				}
				else {
					var analyzer = new mimeParser(options.showTokenize, options.showSymbols, options.errors);
					analyzer.parse(data);
				
					if (analyzer.errorCount == 0){
						var fileName = file.split("/")[file.split("/").length-1];
						var fileNameWithoutExtension = fileName.split('.')[0];
						var filePath = file.split("/").slice(0,-1).join("/");
					
						if (options.json) fs.writeFile(filePath+"/"+fileNameWithoutExtension+".json", JSON.stringify(analyzer.parsedMail[0]), function (err, data){
							if (err) logger.info("Couldn't create : ".red +filePath+"/"+fileNameWithoutExtension+".json : " + err);
							else logger.info("File created : ".green +filePath+"/"+fileNameWithoutExtension+".json");
						});
						
						var encoder = new vcfEncoder();
						encoder.createVcard(analyzer.parsedMail[0]);					fs.writeFile(destination + fileName +".vcf", encoder.vcfData, 'utf8', function(data, err){
							if (err) logger.info("Couldn't create :".red + destination + fileName + ".vcf : " + err);
							else logger.info("File created : ".green + destination + fileName +".vcf");
						});

						logger.debug(analyzer.parsedMail);
					}
				else logger.info(file + " not valid, skipping.");
				}
			});
		})
		
	})

    .command('stats', 'Get stats from mail box')
  	.argument('[files...]', 'The [files...] to exploite, have to be .vcf format')
  	.option('-n, --numberMails', 'show the number of mail exchanges for a specific mail adress', cli.BOOL, false)
  	.option('-b, --buzzyDay', 'show the mails sended during Buzzy Day for a specific mail adress', cli.BOOL, false)
  	.option('-t, --top10Users', 'show the top 10 of interlocutors for a specific mail adress', cli.BOOL, false)
  	.option('-w --top10Words', 'show the top 10 of used words for a specific mail adress')
  	.option('-g --generateChart', 'generate a chart with the mail exchanges for a specific mail adress', cli.BOOL, false)
  	.action(function(args, options, logger){

  		args.files.forEach(function(file){
  			fs.readFile(file, 'utf8', function (err,data) {
  				if (err) {
  					return logger.warn(err);
  				}
  				else {
  					s.main(args, options);
  				}
  			});
  		});
  	})

    // Encode to csv
    .command('csv', 'Encode Mime [files...] to csv format')
    .argument('[files...]', 'Files to check with Mime parser')
    .option('-s, --showSymbols', 'log the analyzed symbol at each step', cli.BOOL, false)
    .option('-t, --showTokenize', 'log the tokenization results', cli.BOOL, false)
    .option('-e, --errors', 'log errors', cli.BOOL, false)
    .option('-g1 --graphe1', 'create a graph', cli.BOOL, false)
    .action(function (args, options, logger) {
        args.files.forEach(function (file) {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) {
                    return logger.warn(err);
                }
                var analyzer = new mimeParser(options.showTokenize, options.showSymbols, options.errors);
                analyzer.parse(data);
                if (analyzer.errorCount === 0) {
                    if (analyzer.crashed) looger.info(file.red + " file crashed the parser".red);
                    else {
                        logger.info(file.green + " file is a valid Mime file".green);
                        datatable.push(analyzer.parsedMail[0]);
                        encoder.encode(datatable);

                        //Réalisation des graphes
                        /*if (options.graphe1) {
                            fs.writeFile(filePath + "/" + fileNameWithoutExtension + ".csv", CSV.stringify(analyzer.parsedMail[0]), function (err, data) {
                                if (err) logger.info("Couldn't create : ".red + filePath + "/" + fileNameWithoutExtension + ".csv : " + err);
                                else logger.info("File added : ".green + filePath + "/" + fileNameWithoutExtension + ".csv");
                            });
                        }
                        var avgChart = {
                            "width": 320,
                            "height": 460,
                            "data": {
                                "url": "classeur.csv"
                            },
                            "mark": "point",
                            "encoding": {
                                "x": {
                                    "field": "Horsepower",
                                    "type": "quantitative"
                                },
                                "y": {
                                    "field": "Miles_per_Gallon",
                                    "type": "quantitative"
                                }
                            }


                            const myChart = vegalite.compile(avgChart).spec;

                            SVG version
                            var runtime = vg.parse(myChart);
                            var view = new vg.View(runtime).renderer('svg').run();
                            var mySvg = view.toSVG();
                            mySvg.then(function (res) {
                                fs.writeFileSync("./result.svg", res)
                                view.finalize();
                                logger.info(myChart);
                                logger.info("Chart output : ./result.svg");
                            });
                            */

                    }
                } else {
                    if (analyzer.crashed) logger.info(file.red + " file encountered ".red + analyzer.errorCount + " errors before crashing the parser".red);
                    else logger.info(file.red + " file contains ".red + analyzer.errorCount + " error(s)".red);
                }
                logger.debug(analyzer.parsedMail);
            });
        }) 
        var encoder = new csvEncoder();
        encoder.encode(datatable);
    })

cli.parse(process.argv);
