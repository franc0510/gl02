/*
npm install papaparse
npm install file-class
npm install colors
npm install vega
npm install vega-lite
npm install vega-embed
npm install readline-sync
*/
var fs = require('fs');
var Papa = require('papaparse');
var readline = require('readline-sync');




function nbMailsPeriode(jsonObj, day_min , day_max, mail) {
  console.log(day_max,day_min);
    let cpt=0;
    for (var i = 0; i < jsonObj.data.length; i++){
      var obj = jsonObj.data[i];
      let day = new Date(obj.date);
      let mail_from = obj.sender;
      let mail_to = obj.recipient;
      if(day>=day_min && day <= day_max && (mail_from==mail || mail_to==mail)){
        cpt++;
      }
    }
    console.log("Number of mails sent from ",day_min," recipient ",day_max);
    console.log("=================================");
    console.log(cpt);
    console.log("=================================");
}

function BuzzyDay(jsonObj){

    var arr = jsonObj.data.filter( function(obj){
      var date = new Date(obj.date);
      if (date.getDay() >= 5 ||date.getHours()>=22 || date.getHours()<=8) {
        return true;
      }
      else {
        return false;
      }
    })
    console.log("Mails sent during a Buzzy Day\n");
    console.log("=================================");
    for(let i=0; i<arr.length;i++){
        console.log(arr[i]);
    }
    console.log("=================================");
}

function Top10Interlocuteur(jsonObj, mail){
  console.log("Ranking of interlocutors of ", mail);
  console.log("=================================");
  var arr = TopInterlocuteur(jsonObj, mail);
  for (let i = 0; i<10 ; i++){
    if(arr[i] != undefined){
      console.log(i+1," ",arr[i]);
    }
  }
  console.log("=================================");
}


function TopInterlocuteur(jsonObj, mail){
  var topInterlocuteurTemp = [];
  var topInterlocuteurArray = [];

  jsonObj.data.forEach(email => {
      if (email.recipient == mail) {
        topInterlocuteurTemp.push({
            'mail': email.sender,
            'nbmail': 1});
      }
      else if (email.sender == mail) {
        topInterlocuteurTemp.push({
            'mail': email.recipient,
            'nbmail': 1});
      }
  });


  topInterlocuteurTemp.forEach(elt =>{
    let cpt = 0;
    let mail_temp;
    for(let i = 0; i < topInterlocuteurTemp.length; i++){
      mail_temp = elt.mail;
        if(topInterlocuteurTemp[i].mail == elt.mail && topInterlocuteurTemp[i].mail != ""){
          cpt ++;
          topInterlocuteurTemp[i] = "";
        }
      }
      if(mail_temp != undefined){
      topInterlocuteurArray.push({
          'mail': mail_temp,
          'nbmail': cpt});
          }
    });



  topInterlocuteurArray.sort((a, b) => {
      return a.mail - b.mail;
  });

  return topInterlocuteurArray;
}

function MotsFreq(jsonObj, mail) {
    var arr = jsonObj.data.filter(function(obj){
      if(obj.sender == mail || obj.recipient == mail){
        return true;
      }
      else{
        return false;
      }
    });

    var string = "";
    for(let i = 0; i < arr.length; i++){
      string = string.concat(arr[i].content);
    }

    var mots = string.replace(/[.]/g, '').split(/\s/);
    var freq = {};
    mots.forEach(function(w) {
        if (!freq[w]) {
            freq[w] = 0;
        }
        freq[w] += 1;
    });

    var sortable = [];
    for (var elt in freq) {
        sortable.push([elt, freq[elt]]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    console.log("Ranking of the most used terms in ", mail);
    console.log("=================================");
    for(let i = 0; i < 10; i++){
      console.log(i+1, sortable[i]);
    }
    console.log("=================================");
}

function Graph(jsonObj, mail){

  var str1 = '<!DOCTYPE html><html><head><title>Number of Collaborators</title><script src="https://cdn.jsdelivr.net/npm/vega@4.3.0"></script><script src="https://cdn.jsdelivr.net/npm/vega-lite@3.0.0-rc8"></script><script src="https://cdn.jsdelivr.net/npm/vega-embed@3.20.0"></script></head><body><div id="vis"></div><script type="text/javascript">var yourVlSpec = {"$schema": "https://vega.github.io/schema/vega-lite/v2.json","data": {"values" :';
  var str2 = '},"mark": "point","encoding": {"x": {"field": "mail", "type": "nominal"},"size": {"field": "nbmail", "type": "quantitative"}}}\nvegaEmbed("#vis", yourVlSpec);</script></body></html>';
  var arr = TopInterlocuteur(jsonObj, mail);
  for(let i = 0; i < arr.length; i++){
    if(arr[i] === undefined){
      arr.splice(i,1);
    }
  };

  console.log(arr);
  try{
    fs.unlink('./data.html', err);
  }catch(err){
    console.log("");;
  }

  fs.open('./data.html', 'w', (err) => {
    console.log('File created');
  });
  fs.writeFile('./data.html', str1, (err) => {
    console.log('.');
  });
  fs.appendFile('./data.html', JSON.stringify(arr), (err) => {
    console.log(".");
  });
  fs.appendFile('./data.html', str2, (err) => {
    console.log(".");
  });
  console.log("You can open the file data.html to visualize the chart");

}

function main(args, options){

  console.log(args, options);
  var email = "john.arnold@enron.com";
  var d1 = new Date("1999-01-01");
  var d2 = new Date("2018-01-01");
  nbMailsPeriode(jsonObj, d1 , d2, email);
  BuzzyDay(jsonObj);
  Top10Interlocuteur(jsonObj, email);
  MotsFreq(jsonObj, email);
  Graph(jsonObj, email);

  return 1;
}

module.exports = {
   main: function main(args, options){
     var path = "./"+args.files;
     var content = fs.readFileSync(path, "utf8");

     var jsonObj = Papa.parse(content, {
       header : true
     });

      if (options.numberMails){
        var mail = readline.question("Enter the chosen mail adress\n");
        var d1 = new Date(readline.question("Enter the beginning date\n"));
        var d2 = new Date(readline.question("Enter the end date\n"));
        nbMailsPeriode(jsonObj, d1 , d2, mail);
      }else if (options.buzzyDay){
        BuzzyDay(jsonObj);

      }else if (options.top10Users){
        var mail = readline.question("Enter the chosen mail adress\n");
        Top10Interlocuteur(jsonObj, mail);

      }else if (options.top10Words){
        var mail = readline.question("Enter the chosen mail adress\n");
        MotsFreq(jsonObj, mail);

      }else if (options.generateChart){
        var mail = readline.question("Enter the chosen mail adress\n");
        Graph(jsonObj, mail);
      }else console.log("Command unknown");
   }
}
