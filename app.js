const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");
const PORT = process.env.PORT || 3000;
// inicijalizacija aplikacije i softvera koji povezuje bazu podataka i aplikaciju
const app = express();
app.use(express.json());
// konekcija sa bazom podataka
let db;
connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`App listen port ${PORT}`);
    });
    // getDb vraca konekciju baze podataka sa kojom mozemo da preuzmemo podatke
    db = getDb();
  }
});

// putanja do baze podataka
app.get("/books", (req, res) => {
  // trenutna strana - ako ne zelimo da nam se prikazuju svi dokumenti iz kolecije koristimo kveri parametre. Ovim parametrima pristupamo iz rekvest objekta
  // ovo znaci ako korisnik nije uneo zeljenu stranu automacki ce se prebaciti na stranicu 0 a ako je uneo apilikacija ce zanemariti logicku nulu
  const page = req.query.page || 0;
  // definisemo koliko zelimo dokumenata da nam se pojavljuje po stranicij
  const booksPerPage = 3;
  let books = [];
  db.collection("books")
    .find() //vraca cursor da dobijemo podatke moramo da koristimo filter toArray ili forEach
    .sort({ author: 1 })
    // skip nam pomaze da prekocimo stranice definisali smo da zelimo da nam se prikazuju 3 knije po strainici pa ovako zamislimo da prva stranica ima 3 knje zatim zelimo da odemo na drugu stranicu znaci da preskocimo te 3 knjige pa je sport bilo koja vrednost uneata u constai page znaci bilo koja straince u nasem slucaju je 1 pomnozeno sa onoliko knjiga koliko zelimo da preskocimo u nasem slucaju to je 3 a nakon toga zelimo da prikazemo 3 knjige pa ce mo korisiti limit metod koji ce resi samo nam fecuj 3 knige kada predjemo na drugu stranicu
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "Greska na serveru, nemoguce je prikazati dokumente" });
    });
  // res.json({mssg: "Dobro dosli na api"})
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: ObjectId(req.params.id) })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res
          .status(500)
          .json({ error: "Greska na serveru, nemoguce je prikazati dokument" });
      });
  } else {
    res.status(500).json({ error: "Dokument id nije validan" });
  }
  //  db.collection("books")
  // .findOne({_id: ObjectId(req.params.id)})
  // .then(doc => {
  //  res.status(200).json(doc)
  // })
  // .catch(err => {
  //  res.status(500).json({error: "Greska na serveru, nemoguce je prikazati dokument" })
  // })
});

app.post("/books", (req, res) => {
  const book = req.body;

  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ err: "Greska na serveru, nemoguce je prikazati dokument" });
    });
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res
          .status(500)
          .json({ error: "Greska na serveru, nemoguce je obrisati dokument" });
      });
  } else {
    res.status(500).json({ error: "Dokument id nije validan" });
  }
});

app.patch("/books/:id", (req, res) => {
  const updates = req.body;
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({
          error: "Greska na serveru, nemoguce je obrisati dokument",
        });
      });
  } else {
    res.status(500).json({ error: "Dokument id nije validan" });
  }
});
// indeksi omogucavaju da se nadje dokument efikasnije bez potrebe pregledavanja cele kolekcije na primer zelimo da fecujemo odredjena poja dokumenata u nasem slucaju na primer zelimo da fecujemo sve knjige koje imaju rejting 10 normalno bi mogno db skenirao celu kolkciju dokumenata da nadje dokumente sa rejtingom 10 ako imao mnogo dukumenata to je spor proces da bi to olaksali mozemo da napravimo indekse za svako poblje koje zelimo da prikazemo koje ce biti pregledani i reci gde da se traze zadata polja u uslovima mongodb indeksi ce biti liste vrednosti sortiranih polja u nasem dokumentu na primer mozemo imati indekse zasnivane na vrednosti rejtiga skvai od tih idneksa ce pokazivati na dokument od koga su dosli i kada se posalje zahev mongo db -u da prikaze sva polja koja imaju rejting 10 recimo on ce lako videti sve vrednosti koje su jednake 10 i prikazati te dokumente - ne trebamo uvek koristiti indekse oni treba da vrate podskup dokumeta
