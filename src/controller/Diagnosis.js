(function() {
    'use strict';

    const distributed                   = require('distributed-prototype');
    const RelationalResourceController  = distributed.RelationalResourceController;
    const RelationalRequest             = distributed.RelationalRequest;
    const log                           = require('ee-log');
    const type                          = require('ee-types');






    module.exports = class Diagnosis extends RelationalResourceController {


        constructor(options) {
            super('diagnosis');

            this.db = options.db;
            this.Related = options.Related;


            this.enableAction('list');
        }




        list(request, response) {
            const diagnosisQuery = this.db.diagnosis();

            diagnosisQuery.getBacteria('id');
            diagnosisQuery.getDiagnosisLocale('*');


            diagnosisQuery.find().then((diagnosis) => {
                const data = diagnosis.map((d) => {

                    return {
                        bacteria: d.bacteria.map(b => b.id)
                        , id: d.id
                        , id_country: 1
                        , id_primaryTherapy: null
                        , id_topic: 10
                        , locales: d.diagnosisLocale.filter(l => l.id_locale === 1).map(l => ({id_language: 1, language: 'de', title: l.title}))
                        , selectedLanguage: 'de'
                        , selectedLanguageId: 1
                        , title: d.diagnosisLocale.filter(l => l.id_locale === 1).map(l => l.title).reduce((l, p) => {return l ? l : p}, '')
                    };
                });


                response.ok(data);
            }).catch(err => response.error('db_error', `Failed to load the diagnosis!`, err));
        }
    }
})();
