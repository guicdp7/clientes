const App = require('./classes/App')

require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

const env = process.env;
const url = env.DB_DOMAIN +
    '://' +
    env.DB_USER +
    ':' +
    env.DB_PASS +
    '@' +
    env.DB_HOST +
    '/' +
    env.DB_NAME +
    (env.DB_COMPLEMENT ? env.DB_COMPLEMENT : '');

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) {
        console.log('connection error: ', err);
    }
    else {
        console.log('-- mongo db connected --');
        const collection = client.db(env.DB_NAME).collection("clients");

        const app = new App(client, collection);

        app.start(env.APP_PORT);
    }
});