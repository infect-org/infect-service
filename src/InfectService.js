(function() {
    'use strict';

    //process.env.debugService = true;

    const distributed       = require('distributed-prototype');
    const RelatedService    = distributed.RelatedService;


    const Related           = require('related');
    const Timestamps        = require('related-timestamps');
    const Localization      = require('related-localization');
    const log               = require('ee-log');



    const AntibioticController = require('./controller/Antibiotic');
    const BacteriaController = require('./controller/Bacteria');
    const DiagnosisController = require('./controller/Diagnosis');
    const ResistanceController = require('./controller/Resistance');



    module.exports = class ShoppingService extends RelatedService {


        constructor(options) {

            // make sure the options exist and the service has a proper name
            options = options || {};


            // default name
            if (!options.name) options.name = 'infect';


            // super will load the controllers
            super(options);


            // db conectivity
            this.related = new Related(options.db);
            this.related.use(new Timestamps());
        }






        // called before the related service loads
        // teh rest
        beforeLoad() {

            // load the db
            return this.related.load().then((db) => {
                this.db = db;

                const schema = this.db[this.dbName];


                this.resourceControllerOptions = {
                      db        : db[this.dbName]
                    , Related   : Related
                    , dbName    : this.dbName
                };


                return Promise.resolve();
            });
        }






        afterLoad() {

            this.registerResource(new AntibioticController(this.resourceControllerOptions));
            this.registerResource(new BacteriaController(this.resourceControllerOptions));
            this.registerResource(new DiagnosisController(this.resourceControllerOptions));
            this.registerResource(new ResistanceController(this.resourceControllerOptions));

            return Promise.resolve();
        }
    };
})();
