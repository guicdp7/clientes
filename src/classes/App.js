const http = require('http');
const Routes = require('../routes/Routes');

module.exports = class App {

    constructor(client, collection) {
        this.client = client;
        this.collection = collection;
    }

    async start(port) {
        const self = this;

        http.createServer(function callback(req, res) {

            let reqData = '';

            req.on('data', function reqDataChunk(chunk) {
                reqData += chunk;
            });

            req.on('end', async function reqEnd() {
                let body;

                if (reqData) {
                    body = reqData;
                }
                const routes = new Routes(req);

                const Controller = routes.getController();

                let response;

                if (Controller) {
                    const controller = new Controller(
                        req,
                        res,
                        body,
                        self.client,
                        self.collection
                    );

                    response = await controller.start();

                    if (response) {
                        if (typeof response === 'string') {
                            res.statusCode = 200;
                            res.end(response);
                            return;
                        }
                        else if (typeof response === 'object') {
                            res.statusCode = response.statusCode;

                            if (response.type === 'json') {
                                res.writeHead(response.statusCode, { "Content-Type": "application/json" });
                                res.end(JSON.stringify(response.data));
                                return;
                            }
                            else if (response.type === 'template') {
                                // continuar
                            }
                        }
                    }
                }

                res.statusCode = 404;
                res.end();
            });
        }).listen(port);

        console.log('-- app started at ' + port + ' --');
    }
}
