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

                const data = compounds.map((compound) => {

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

                    // classes
                    const substanceClasses = [];
                    compound.substance.forEach((substance) => {
                        substance.substanceClass.forEach((substanceClass) => {
                            substanceClass.substanceClassLocale.forEach((locale) => {
                                substanceClasses.push({
                                      id            : locale.id_substanceClass
                                    , id_locale     : locale.id_locale === 1 ? 1 : 10
                                    , languagae     : locale.id_locale === 1 ? 'de' : 'en'
                                    , name          : locale.name
                                });
                            });
                        });
                    });

                    return {
                          po                : compound.perOs
                        , iv                : compound.intraVenous
                        , languagae         : 'de'
                        , id_language       : 1
                        , name              : compound.substance.map(s => s.substanceLocale.filter(l => l.id_locale === 1).map(l => l.name)).map(l => l.length ? l[0] : null).filter(l => !!l).join(' / ')
                        , substances        : substances
                        , substanceClasses  : substanceClasses
                    }
                });


                response.ok(data);
            }).catch(err => response.error('db_error', `Failed to load the antibiotics!`, err));
        }
    }
})();
