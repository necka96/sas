const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const conection =
  "mongodb+srv://Nemanja:antilopa@books.wwqqn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let dbConnection;
module.exports = {
  // vrsimo konekciju sa bazom podataka
  connectToDb: (cb) => {
    // MongoClient nam omogucava konekciju sa bazom podataka
    // connection prima argumenat conection-string a to je mongodb url
    MongoClient.connect(conection)
      // kada se konekcija uspostavi dobijamo pristup arugmentu koji se zove client, cilent sadrzi obdzekt koj se zove db i on nam vraca  db konekciju
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  // vraca konekciju baze podataka kada je ona uspostavljena i ona nam omogucava da komuniciramo sa bazom podataka znaci da prikupimo podatke apdejtujemo podatke obrisemo podatke procitamo poatke
  getDb: () => dbConnection,
};
