(function() {
    'use strict';

    const distributed                   = require('distributed-prototype');
    const RelationalResourceController  = distributed.RelationalResourceController;
    const RelationalRequest             = distributed.RelationalRequest;
    const log                           = require('ee-log');
    const type                          = require('ee-types');






    module.exports = class Antibiotic extends RelationalResourceController {


        constructor(options) {
            super('antibiotic');

            this.db = options.db;
            this.Related = options.Related;


            this.enableAction('list');
        }




        list(request, response) {
            this.db.compound('*')
                .fetchCompoundLocale('*')
                .getSubstance('*')
                .fetchSubstanceLocale('*')
                .getSubstanceClass('*')
                .fetchSubstanceClassLocale('*').find().then((compounds) => {


                return Promise.all(compounds.map((compound) => {

                    // get substances
                    const substances = [];
                    compound.substance.forEach((substance) => {
                        substance.substanceLocale.forEach((locale) => {
                            substances.push({
                                  id            : locale.id_substance
                                , id_locale     : locale.id_locale === 1 ? 1 : 10
                                , languagae     : locale.id_locale === 1 ? 'de' : 'en'
                                , name          : locale.name
                            });
                        });
                    });


                    // collect the substance classes
                    const classes = new Set();
                    compound.substance.forEach(substance => substance.substanceClass.forEach(substanceClass => classes.add(substanceClass)));

                    return Promise.all(Array.from(classes.values()).map((substanceClass) => {
                        // get all parent substabce classes too since this is used for the filter
                        return this.db.substanceClass('*', {
                              left: this.Related.lt(substanceClass.left)
                            , right: this.Related.gt(substanceClass.right)
                        }).fetchSubstanceClassLocale('*').find().then((parentClasses) => {
                            parentClasses.forEach(cls => classes.add(cls));
                        });
                    })).then(() => {
                        const substanceClasses = [];

                        // nice, we got all classes
                        Array.from(classes.values()).forEach((substanceClass) => {
                            substanceClass.substanceClassLocale.forEach((locale) => {
                                substanceClasses.push({
                                      id            : locale.id_substanceClass
                                    , id_locale     : locale.id_locale === 1 ? 1 : 10
                                    , languagae     : locale.id_locale === 1 ? 'de' : 'en'
                                    , name          : locale.name
                                });
                            });
                        });


                        const substances = compound.substance.map(s => s.substanceLocale.filter(l => l.id_locale === 1).map(l => l.name)).map(l => l.length ? l[0] : null).filter(l => !!l);
                        substances.sort();
                        
                        return Promise.resolve({
                              po                : compound.perOs
                            , iv                : compound.intraVenous
                            , languagae         : 'de'
                            , id_language       : 1
                            , name              : substances.join(' / ')
                            , substances        : substances
                            , substanceClasses  : substanceClasses
                            , id                : compound.id
                        });
                    });
                })).then(data => response.ok(data));                
            }).catch(err => log(err));//response.error('db_error', `Failed to load the antibiotics!`, err));
        }
    }
})();
