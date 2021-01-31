const { jsonBody, response } = require('../helpers/ControllerHelpers');
const readFile = require('fs').readFile;
const patch = require('path');
const ObjectID = require('mongodb').ObjectID;

module.exports = class ClientsController {
    constructor(req, res, body, client, collection) {
        this.req = req;
        this.res = res;
        this.body = body;
        this.client = client;
        this.collection = collection;
    }

    async getMethodResponse() {
        const reqMethodPath = this.req.url.replace('/clients', '');

        switch (this.req.method) {
            /* routes for GET method */
            case 'GET':
                /* route /clients/ */
                if (reqMethodPath === '' || reqMethodPath === '/') {
                    return this.index();
                }

                /* route /clients/getAll */
                if (reqMethodPath.indexOf('/getAll') === 0) {
                    return this.getAll(reqMethodPath.replace('/getAll', ''));
                }
                break;
            case "POST":
                /* route /clients/create/ */
                if (reqMethodPath === '/create' || reqMethodPath === '/create/') {
                    return this.create();
                }
                break;
            case 'PUT':
                /* route /clients/editBaId/:id */
                if (reqMethodPath.indexOf('/editBaId/') === 0) {
                    return this.editBaId(reqMethodPath.replace('/editBaId/', ''));
                }
                break;
            case 'DELETE':
                /* route /clients/deleteById/:id */
                if (reqMethodPath.indexOf('/deleteById/') === 0) {
                    return this.deleteById(reqMethodPath.replace('/deleteById/', ''));
                }
                break;
        }

        return undefined;
    }

    async start() {
        const response = this.getMethodResponse();

        if (response) {
            return response;
        }

        return undefined;
    }

    /* methods */
    async index() {
        return new Promise(function callbackFunction(callback) {
            readFile(patch.resolve(__dirname, '..', 'views', 'clients.html'), function callbackFile(err, resp) {
                if (err) {
                    callback(response(undefined, undefined, 500));
                }
                else {
                    callback(resp.toString());
                }
            });

        });
    }

    async create() {
        const body = jsonBody(this.body);

        if (body && body.cpf && body.email) {
            const newClient = {
                name: body.name || null,
                genre: body.genre || null,
                cpf: body.cpf,
                email: body.email,
                phone: body.phone || null,
                createdAt: (new Date()).toString(),
                updatedAt: null
            };

            const result = (await this.collection.insertOne(newClient)).ops[0];

            return response('json', result);
        }

        return response('json', {
            error: true,
            message: 'body data invalid'
        }, 500);
    }

    async deleteById(idParam) {
        const id = ObjectID(idParam);

        const numberOfClients = (await this.collection.deleteOne({ _id: id })).deletedCount;

        return response('json', {
            status: true,
            message: numberOfClients + ' client deleted'
        });
    }

    async editBaId(idParam) {
        const body = jsonBody(this.body);

        if (body) {
            const id = ObjectID(idParam);

            const oldClient = await this.collection.findOne({ _id: id });

            if (oldClient) {
                const updatedClient = {
                    name: body.name || oldClient.name,
                    genre: body.genre || oldClient.genre,
                    cpf: body.cpf || oldClient.cpf,
                    email: body.email || oldClient.email,
                    phone: body.phone || oldClient.phone,
                    createdAt: oldClient.createdAt,
                    updatedAt: (new Date()).toString()
                };

                await this.collection.updateOne({ _id: id }, { $set: updatedClient });

                updatedClient._id = idParam;

                return response('json', updatedClient);
            }

            return response('json', {
                error: true,
                message: 'client not found'
            }, 404);
        }

        return response('json', {
            error: true,
            message: 'body data invalid'
        }, 500);
    }

    async getAll(filters) {
        const clients = await this.collection.find({}).toArray();

        return response('json', {
            clients
        });
    }
}