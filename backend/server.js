// load required modules

var express=require('express');
var cors = require('cors');
var bodyParser=require('body-parser');
var app = express();
const md5 = require('spark-md5');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { json } = require('body-parser');
// load local .env if present
require("dotenv").config();

// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
// set the database name
const dbName = 'guestbook';

let cloudant_apikey,cloudant_url;

let cors_config={
  origin: "*",
  methods: "GET,POST",
  preflightContinue: false,
  optionsSuccessStatus: 204
}
// extract the Cloudant API key and URL from the credentials
// !!! note the lower case service name !!!
if(process.env.CE_SERVICES) {
  ce_services=JSON.parse(process.env.CE_SERVICES);
  cloudant_apikey=ce_services['cloudantnosqldb'][0].credentials.apikey;
  cloudant_url=ce_services['cloudantnosqldb'][0].credentials.url;
}
// allow overwriting of Cloudant setup or to specify using environment variables
if (process.env.CLOUDANT_URL) {
  cloudant_url=process.env.CLOUDANT_URL;
}
if (process.env.CLOUDANT_APIKEY) {
  cloudant_apikey=process.env.CLOUDANT_APIKEY;
}

// to overwrite the origin for testing
if (process.env.CORS_ORIGIN) {
  cors_config.origin=process.env.CORS_ORIGIN;
}



// establish IAM-based authentication
const authenticator = new IamAuthenticator({
  apikey: cloudant_apikey,
});

// create a new client
const cloudantClient = CloudantV1.newInstance({authenticator: authenticator,
  serviceUrl: cloudant_url});


  
// create mydb database if it does not already exist
cloudantClient.putDatabase({ db: dbName})
    .then(data => {
      console.log(dbName + ' database created');
    })
    .catch(error => {
      // ignore if database already exists
      if (error.status === 412) {
        console.log(dbName + ' database already exists');
      } else {
        console.log('Error occurred when creating ' + dbName +
        ' database', error.error);
      }
});
  

// add a new name or item with timestamp info for sorting
app.post("/guestbook/entries", cors(cors_config), function (req, res, next) {
  console.log('In route - add entry');
  let entry = {
    createdAt: new Date().toISOString(),
    name: req.body.name,
    description: req.body.description || 'No description provided',
    status: req.body.status || 'free',
    image: req.body.image || 'https://www.shutterstock.com/image-vector/no-image-available-vector-hand-260nw-745639717.jpg',
    category: req.body.category || 'General' // Agregar un valor por defecto si no se proporciona
  };
  
  return cloudantClient.postDocument({
    db: dbName,
    document: entry,
  })
    .then(addedEntry => {
      console.log('Add entry successful');
      return res.status(201).json(entry); // Devuelve el objeto entry con valores reales guardados
    })
    .catch(error => {
      console.log('Add entry failed');
      return res.status(500).json({
        message: 'Add entry failed.',
        error: error,
      });
    });
});


// retrieve the existing entries
app.get("/guestbook/entries", cors(cors_config), function (req, res, next) {
  console.log('In route - get entries');

  return cloudantClient.postAllDocs({
    db: dbName,
    includeDocs: true,
  })
    .then(allDocuments => {
      let fetchedEntries = allDocuments.result;
      let entries = {entries: fetchedEntries.rows.map((row) => {
        return {
          name: row.doc.name,
          image: row.doc.image,
          status: row.doc.status,
          description: row.doc.description,
          category: row.doc.category, // Asegúrate de incluir el nuevo campo
          createdAt: row.doc.createdAt
        };
      })};
      console.log('Get entries successful');
      return res.json(entries);
    })
    .catch(error => {
      console.log('Get entries failed');
      return res.status(500).json({
        message: 'Get entries failed.',
        error: error,
      });
    });
});

app.get('/', (req, res) => {
  res.send('healthy')
})
//serve static file (index.html, js, css)
//app.use(express.static(__dirname + '/views'));

var port = process.env.PORT || 8080
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
