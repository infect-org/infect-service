(function() {
    'use strict';

    const distributed                   = require('distributed-prototype');
    const RelationalResourceController  = distributed.RelationalResourceController;
    const RelationalRequest             = distributed.RelationalRequest;
    const log                           = require('ee-log');
    const type                          = require('ee-types');






    module.exports = class Resistance extends RelationalResourceController {


        constructor(options) {
            super('resistance');

            this.db = options.db;
            this.Related = options.Related;


            this.enableAction('list');
        }




        list(request, response) {

            if (this.matrix) response.ok(this.matrix);
            else {
                return Promise.resolve().then(() => {
                    if (this.matrixData) return Promise.resolve();
                    else {
                        return Promise.all(matrixData.map((set) => {
                            return this.db.bacteria().getSpecies({identifier: set.bacteria}).findOne().then((bac) => {
                                set.bac = bac;

                                return this.db.compound({identifier: set.compound}).findOne().then((com) => {

                                    set.com = com;
                                    return Promise.resolve(set);
                                });
                            });
                        })).then((matrix) => {
                            this.matrixData = matrix.filter(x => x.bac && x.com).map(x => ({id_bacteria: x.bac.id, id_compound: x.com.id, resistance: x.level}));
                            return Promise.resolve();
                        }).catch(log);
                    }
                }).then(() => {


                    // get values from db
                    return this.db.resistanceSample(['id_bacteria', 'id_compound']).fetchDataSource('*', {
                        identifier: this.Related.in('defaultValue', 'classDefaultValue', 'userDefinedValue')
                    }).fetchResistanceLevel('*').find().then((records) => {
                        const matrix = new Map();

                        records.filter(x => x.resistanceLevel && x.dataSource).forEach((record) => {
                            if (!matrix.has(record.id_bacteria)) matrix.set(record.id_bacteria, new Map());
                            if (!matrix.get(record.id_bacteria).has(record.id_compound)) matrix.get(record.id_bacteria).set(record.id_compound, {id_bacteria: record.id_bacteria, id_compound: record.id_compound});

                            const item = matrix.get(record.id_bacteria).get(record.id_compound);

                            if (record.dataSource.identifier === 'defaultValue') item.resistanceDefault = this.getValue(record.resistanceLevel.identifier);
                            else if (record.dataSource.identifier === 'classDefaultValue') item.classResistanceDefault = this.getValue(record.resistanceLevel.identifier);
                            else if (record.dataSource.identifier === 'userDefinedValue') item.resistanceUser = this.getValue(record.resistanceLevel.identifier);
                        });


                        // add matrix values
                        this.matrixData.forEach((record) => {
                            if (!matrix.has(record.id_bacteria)) matrix.set(record.id_bacteria, new Map());
                            if (!matrix.get(record.id_bacteria).has(record.id_compound)) matrix.get(record.id_bacteria).set(record.id_compound,  {id_bacteria: record.id_bacteria, id_compound: record.id_compound});

                            const item = matrix.get(record.id_bacteria).get(record.id_compound);

                            item.resistanceImport = record.resistance;
                        });

                        // convert
                        this.matrix = [];

                        for (const bacteria of matrix.values()) {
                            for (const compound of bacteria.values()) {
                                this.matrix.push(compound);
                            }
                        }

                        response.ok(this.matrix);
                    });
                }).catch(err => response.error('db_error', `Failed to load the resistances!`, err));
            }
        }




        getValue(identifier) {
            if (identifier === 'susceptible') return 1;
            else if (identifier === 'intermediate') return 2;
            else if (identifier === 'resistant') return 3;
        }
    }





    const matrixData = [
          {"bacteria": "escherichia coli", "compound": "amoxicillin/clavulanate", "level": 19.1}
        , {"bacteria": "escherichia coli", "compound": "cotrimoxazole", "level": 26.7}
        , {"bacteria": "escherichia coli", "compound": "fosfomycin", "level": 1.8}
        , {"bacteria": "klebsiella sp.", "compound": "tigecycline", "level": 14.1}
        , {"bacteria": "klebsiella sp.", "compound": "cefepime", "level": 5.7}
        , {"bacteria": "enterococcus faecium", "compound": "tigecycline", "level": 0}
        , {"bacteria": "escherichia coli", "compound": "nitrofurantoin", "level": 2.6}
        , {"bacteria": "enterobacter sp.", "compound": "cotrimoxazole", "level": 5.5}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cotrimoxazole", "level": 1.8}
        , {"bacteria": "escherichia coli", "compound": "piperacillin/tazobactam", "level": 7.8}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cotrimoxazole", "level": 35.5}
        , {"bacteria": "citrobacter sp.", "compound": "nitrofurantoin", "level": 24.5}
        , {"bacteria": "staphylococcus aureus", "compound": "linezolid", "level": 0.1}
        , {"bacteria": "klebsiella sp.", "compound": "nitrofurantoin", "level": 56.4}
        , {"bacteria": "enterobacter sp.", "compound": "nitrofurantoin", "level": 66.8}
        , {"bacteria": "proteus mirabilis", "compound": "cotrimoxazole", "level": 34.4}
        , {"bacteria": "klebsiella sp.", "compound": "amoxicillin/clavulanate", "level": 12.9}
        , {"bacteria": "proteus mirabilis", "compound": "fosfomycin", "level": 15.3}
        , {"bacteria": "staphylococcus epidermidis", "compound": "fusidic acid", "level": 48.1}
        , {"bacteria": "staphylococcus epidermidis", "compound": "doxycycline", "level": 29.4}
        , {"bacteria": "klebsiella sp.", "compound": "cotrimoxazole", "level": 12.7}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "piperacillin/tazobactam", "level": 14.5}
        , {"bacteria": "klebsiella sp.", "compound": "piperacillin/tazobactam", "level": 11.5}
        , {"bacteria": "staphylococcus epidermidis", "compound": "penicillin", "level": 88.6}
        , {"bacteria": "staphylococcus aureus", "compound": "penicillin", "level": 78.7}
        , {"bacteria": "staphylococcus aureus", "compound": "vancomycin", "level": 0.1}
        , {"bacteria": "enterococcus faecalis", "compound": "tigecycline", "level": 0.1}
        , {"bacteria": "serratia sp.", "compound": "piperacillin/tazobactam", "level": 4.8}
        , {"bacteria": "staphylococcus aureus", "compound": "rifampicin", "level": 0.8}
        , {"bacteria": "staphylococcus aureus", "compound": "clindamycin", "level": 10.4}
        , {"bacteria": "staphylococcus aureus", "compound": "cotrimoxazole", "level": 2.4}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "ciprofloxacin", "level": 17.1}
        , {"bacteria": "proteus mirabilis", "compound": "amoxicillin/clavulanate", "level": 9.1}
        , {"bacteria": "staphylococcus aureus", "compound": "fusidic acid", "level": 4.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "tigecycline", "level": 0.3}
        , {"bacteria": "escherichia coli", "compound": "cefepime", "level": 6.3}
        , {"bacteria": "streptococcus pneumoniae", "compound": "clindamycin", "level": 13}
        , {"bacteria": "staphylococcus epidermidis", "compound": "rifampicin", "level": 5.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "vancomycin", "level": 0.1}
        , {"bacteria": "staphylococcus epidermidis", "compound": "clindamycin", "level": 37.8}
        , {"bacteria": "staphylococcus aureus", "compound": "doxycycline", "level": 5}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "cefepime", "level": 10.6}
        , {"bacteria": "serratia sp.", "compound": "cotrimoxazole", "level": 2.1}
        , {"bacteria": "citrobacter sp.", "compound": "amoxicillin/clavulanate", "level": 45.8}
        , {"bacteria": "staphylococcus aureus", "compound": "teicoplanin", "level": 0.2}
        , {"bacteria": "proteus mirabilis", "compound": "cefepime", "level": 0.9}
        , {"bacteria": "citrobacter sp.", "compound": "cotrimoxazole", "level": 3.6}
        , {"bacteria": "enterococcus faecalis", "compound": "doxycycline", "level": 74}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "ceftazidime", "level": 11.5}
        , {"bacteria": "proteus vulgaris", "compound": "fosfomycin", "level": 14}
        , {"bacteria": "enterococcus faecalis", "compound": "penicillin", "level": 4.4}
        , {"bacteria": "morganella sp.", "compound": "nitrofurantoin", "level": 97.3}
        , {"bacteria": "acinetobacter sp.", "compound": "piperacillin/tazobactam", "level": 26.5}
        , {"bacteria": "staphylococcus aureus", "compound": "tigecycline", "level": 0}
        , {"bacteria": "enterococcus faecalis", "compound": "vancomycin", "level": 0.1}
        , {"bacteria": "serratia sp.", "compound": "amoxicillin/clavulanate", "level": 99}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cotrimoxazole", "level": 5.8}
        , {"bacteria": "proteus mirabilis", "compound": "piperacillin/tazobactam", "level": 1.5}
        , {"bacteria": "proteus mirabilis", "compound": "nitrofurantoin", "level": 99.6}
        , {"bacteria": "enterobacter sp.", "compound": "cefepime", "level": 6.7}
        , {"bacteria": "citrobacter sp.", "compound": "fosfomycin", "level": 1.6}
        , {"bacteria": "klebsiella sp.", "compound": "fosfomycin", "level": 28.2}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "teicoplanin", "level": 1.6}
        , {"bacteria": "streptococcus pneumoniae", "compound": "cotrimoxazole", "level": 14.7}
        , {"bacteria": "enterococcus faecium", "compound": "linezolid", "level": 0.3}
        , {"bacteria": "staphylococcus epidermidis", "compound": "teicoplanin", "level": 12.4}
        , {"bacteria": "serratia sp.", "compound": "cefepime", "level": 1}
        , {"bacteria": "enterococcus faecium", "compound": "vancomycin", "level": 1.4}
        , {"bacteria": "morganella sp.", "compound": "piperacillin/tazobactam", "level": 7.4}
        , {"bacteria": "enterobacter sp.", "compound": "piperacillin/tazobactam", "level": 23}
        , {"bacteria": "morganella sp.", "compound": "cotrimoxazole", "level": 16.7}
        , {"bacteria": "escherichia coli", "compound": "tigecycline", "level": 0.6}
        , {"bacteria": "serratia sp.", "compound": "fosfomycin", "level": 32}
        , {"bacteria": "citrobacter sp.", "compound": "cefepime", "level": 1.7}
        , {"bacteria": "morganella sp.", "compound": "amoxicillin/clavulanate", "level": 99.7}
        , {"bacteria": "proteus vulgaris", "compound": "amoxicillin/clavulanate", "level": 13.9}
        , {"bacteria": "haemophilus influenzae", "compound": "azithromycin", "level": 47.2}
        , {"bacteria": "citrobacter sp.", "compound": "piperacillin/tazobactam", "level": 12}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "linezolid", "level": 0.8}
        , {"bacteria": "morganella sp.", "compound": "cefepime", "level": 1.9}
        , {"bacteria": "enterobacter sp.", "compound": "amoxicillin/clavulanate", "level": 99.2}
        , {"bacteria": "staphylococcus epidermidis", "compound": "linezolid", "level": 0.2}
        , {"bacteria": "proteus vulgaris", "compound": "nitrofurantoin", "level": 99.5}
        , {"bacteria": "haemophilus influenzae", "compound": "amoxicillin/clavulanate", "level": 11.3}
        , {"bacteria": "streptococcus pneumoniae", "compound": "cefuroxime axetil", "level": 2.3}
        , {"bacteria": "proteus mirabilis", "compound": "tigecycline", "level": 98.5}
        , {"bacteria": "enterococcus faecalis", "compound": "linezolid", "level": 0.6}
        , {"bacteria": "haemophilus ducreyi", "compound": "erithromycin", "level": 1.2}
        , {"bacteria": "enterobacter sp.", "compound": "fosfomycin", "level": 42}
        , {"bacteria": "burkholderia sp.", "compound": "cefepime", "level": 0}
        , {"bacteria": "streptococcus pneumoniae", "compound": "doxycycline", "level": 15.6}
        , {"bacteria": "enterobacter sp.", "compound": "tigecycline", "level": 9.9}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "penicillin", "level": 87}
        , {"bacteria": "enterococcus faecium", "compound": "penicillin", "level": 86.4}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "fusidic acid", "level": 79.7}
        , {"bacteria": "streptococcus pneumoniae", "compound": "penicillin", "level": 9.4}
        , {"bacteria": "proteus vulgaris", "compound": "cotrimoxazole", "level": 13.2}
        , {"bacteria": "proteus vulgaris", "compound": "piperacillin/tazobactam", "level": 2.6}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "levofloxacin", "level": 18.5}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "vancomycin", "level": 0}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "rifampicin", "level": 0.3}
        , {"bacteria": "acinetobacter sp.", "compound": "cefepime", "level": 17.8}
        , {"bacteria": "morganella sp.", "compound": "fosfomycin", "level": 98.7}
        , {"bacteria": "serratia sp.", "compound": "nitrofurantoin", "level": 98.1}
        , {"bacteria": "acinetobacter sp.", "compound": "cotrimoxazole", "level": 15.7}
        , {"bacteria": "proteus vulgaris", "compound": "cefepime", "level": 1.2}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "doxycycline", "level": 9.5}
        , {"bacteria": "proteus vulgaris", "compound": "tigecycline", "level": 72.5}
        , {"bacteria": "citrobacter sp.", "compound": "tigecycline", "level": 3.4}
        , {"bacteria": "haemophilus influenzae", "compound": "cotrimoxazole", "level": 23.6}
        , {"bacteria": "enterococcus faecium", "compound": "doxycycline", "level": 25.3}
        , {"bacteria": "salmonella sp.", "compound": "cotrimoxazole", "level": 8.4}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "clindamycin", "level": 10.5}
        , {"bacteria": "mycobacterium tuberculosis", "compound": "rifampicin", "level": 3}
        , {"bacteria": "morganella sp.", "compound": "tigecycline", "level": 67.1}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "tigecycline", "level": 0}
        , {"bacteria": "serratia sp.", "compound": "tigecycline", "level": 22.9}
        , {"bacteria": "haemophilus influenzae", "compound": "clarithromycin", "level": 73.9}
        , {"bacteria": "enterococcus faecalis", "compound": "fosfomycin", "level": 60.9}
        , {"bacteria": "shigella sp.", "compound": "cotrimoxazole", "level": 83.4}
        , {"bacteria": "neisseria gonorrhoeae", "compound": "doxycycline", "level": 60}
        , {"bacteria": "neisseria gonorrhoeae", "compound": "cefuroxime axetil", "level": 0.2}
        , {"bacteria": "campylobacter sp.", "compound": "erithromycin", "level": 15.1}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "minocycline", "level": 2.1}
        , {"bacteria": "neisseria gonorrhoeae", "compound": "penicillin", "level": 78.1}
        , {"bacteria": "neisseria meningitidis", "compound": "rifampicin", "level": 1.5}
        , {"bacteria": "neisseria meningitidis", "compound": "penicillin", "level": 38.6}
        , {"bacteria": "burkholderia sp.", "compound": "cotrimoxazole", "level": 0}
        , {"bacteria": "enterococcus faecium", "compound": "fosfomycin", "level": 45}
        , {"bacteria": "burkholderia sp.", "compound": "nitrofurantoin", "level": 60}
        , {"bacteria": "burkholderia sp.", "compound": "amoxicillin/clavulanate", "level": 72.7}
        , {"bacteria": "burkholderia sp.", "compound": "piperacillin/tazobactam", "level": 0}
        , {"bacteria": "burkholderia sp.", "compound": "fosfomycin", "level": 0}
    ];
})();
