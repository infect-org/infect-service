(function() {
    'use strict';

    const distributed                   = require('distributed-prototype');
    const RelationalResourceController  = distributed.RelationalResourceController;
    const RelationalRequest             = distributed.RelationalRequest;
    const log                           = require('ee-log');
    const type                          = require('ee-types');






    module.exports = class Bacteria extends RelationalResourceController {


        constructor(options) {
            super('bacteria');

            this.db = options.db;
            this.Related = options.Related;


            this.enableAction('list');
        }




        list(request, response) {
            const bacteriaQuery = this.db.bacteria('*');

            bacteriaQuery.getShape('*').getShapeLocale('*');
            bacteriaQuery.getGrouping('*').getGroupingLocale('*');
            bacteriaQuery.getBacteriaLocale('*');
            bacteriaQuery.getSpecies('*').getGenus('*');


            bacteriaQuery.find().then((bacterias) => {
                const data = bacterias.map((bacteria) => {

                    return {
                          aerobic               : bacteria.aerobic
                        , aerobicOptional       : bacteria.aerobicOptional
                        , anaerobic             : bacteria.anaerobic
                        , anaerobicOptional     : bacteria.anaerobicOptional
                        , genus                 : bacteria.species.genus.name
                        , gram                  : bacteria.gram
                        , grouping              : bacteria.grouping ? bacteria.grouping.groupingLocale.filter(l => l.id_locale === 1).map(l => l.name).reduce((l, p) => {return l ? l : p}, '') : ''
                        , groupingLocales       : bacteria.grouping ? bacteria.grouping.groupingLocale.filter(l => l.id_locale === 1).map(g => ({id_language: 1, language: 'de', name: g.name})) : []
                        , id                    : bacteria.id
                        , id_grouping           : bacteria.id_grouping
                        , id_shape              : bacteria.id_shape
                        , id_species            : bacteria.id_species
                        , localeNames           : bacteria.bacteriaLocale ? bacteria.bacteriaLocale.filter(l => l.id_locale === 1).map(g => ({id_language: 1, language: 'de', name: g.name})) : []
                        , name                  : `${bacteria.species.genus.name} / ${bacteria.species.name.replace(bacteria.species.genus.name, '')}`.replace(/\s{2,}/, ' ')
                        , selectedLanguage      : 'de'
                        , selectedLanguageId    : 1
                        , shape                 : bacteria.shape ? bacteria.shape.shapeLocale.filter(l => l.id_locale === 1).map(l => l.name).reduce((l, p) => {return l ? l : p}, '') : ''
                        , shapeLocales          : bacteria.shape ? bacteria.shape.shapeLocale.filter(l => l.id_locale === 1).map(g => ({id_language: 1, language: 'de', name: g.name})) : []
                        , species               : bacteria.species.name
                    };
                });


                response.ok(data);
            }).catch(err => response.error('db_error', `Failed to load the bacteria!`, err));
        }
    }
})();
