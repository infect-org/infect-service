(function() {
    'use strict';

    //process.env.debugService = true;

    const distributed       = require('distributed-prototype');
    const RelatedService    = distributed.RelatedService;


    const Related           = require('related');
    const Timestamps        = require('related-timestamps');
    const Localization      = require('related-localization');
    const log               = require('ee-log');






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



            this.autoLoad('bacteria');
            this.autoLoad('city');
            this.autoLoad('classResistance');
            this.autoLoad('compound');
            this.autoLoad('country_language');
            this.autoLoad('dataSource');
            this.autoLoad('diagnosis');
            this.autoLoad('diagnosis_bacteria');
            this.autoLoad('drug');
            this.autoLoad('gender');
            this.autoLoad('genus');
            this.autoLoad('grouping');
            this.autoLoad('organ');
            this.autoLoad('organGroup');
            this.autoLoad('region');
            this.autoLoad('region_city');
            this.autoLoad('resistanceLevel');
            this.autoLoad('resistanceSample');
            this.autoLoad('sex');
            this.autoLoad('shape');
            this.autoLoad('species');
            this.autoLoad('substance');
            this.autoLoad('substance_compound');
            this.autoLoad('substance_substanceClass');
            this.autoLoad('substanceClass');
            this.autoLoad('tenant');
            this.autoLoad('therapy');
            this.autoLoad('therapy_compound');
            this.autoLoad('topic');
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
    };
})();
