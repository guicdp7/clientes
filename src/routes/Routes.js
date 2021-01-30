const ClientsController = require('../controllers/ClientsController');

module.exports = class Routes {

    constructor(req) {
        this.req = req;
    }

    getController() {
        const reqUrl = this.req.url;

        if (reqUrl === '/' || reqUrl.indexOf('/clients') === 0) {
            return ClientsController;
        }

        return undefined;
    }

}