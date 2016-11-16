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
                                if (compound.resistanceDefault === undefined) compound.resistanceDefault = compound.classResistanceDefault;
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
          {"bacteria": "escherichia coli", "compound": "amoxicillin/clavulanate", "level": 20.2}
        , {"bacteria": "escherichia coli", "compound": "cotrimoxazole", "level": 26.7}
        , {"bacteria": "escherichia coli", "compound": "fosfomycin", "level": 1.8}
        , {"bacteria": "klebsiella sp.", "compound": "tigecycline", "level": 14.1}
        , {"bacteria": "klebsiella sp.", "compound": "cefepime", "level": 6.6}
        , {"bacteria": "enterococcus faecium", "compound": "tigecycline", "level": 0}
        , {"bacteria": "escherichia coli", "compound": "nitrofurantoin", "level": 2.6}
        , {"bacteria": "enterobacter sp.", "compound": "cotrimoxazole", "level": 5.5}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cotrimoxazole", "level": 1.8}
        , {"bacteria": "escherichia coli", "compound": "piperacillin/tazobactam", "level": 9.4}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cotrimoxazole", "level": 35.5}
        , {"bacteria": "citrobacter sp.", "compound": "nitrofurantoin", "level": 24.5}
        , {"bacteria": "staphylococcus aureus", "compound": "linezolid", "level": 0.1}
        , {"bacteria": "klebsiella sp.", "compound": "nitrofurantoin", "level": 56.4}
        , {"bacteria": "enterobacter sp.", "compound": "nitrofurantoin", "level": 66.8}
        , {"bacteria": "proteus mirabilis", "compound": "cotrimoxazole", "level": 34.4}
        , {"bacteria": "klebsiella sp.", "compound": "amoxicillin/clavulanate", "level": 13.5}
        , {"bacteria": "proteus mirabilis", "compound": "fosfomycin", "level": 15.3}
        , {"bacteria": "staphylococcus epidermidis", "compound": "fusidic acid", "level": 48.1}
        , {"bacteria": "staphylococcus epidermidis", "compound": "doxycycline", "level": 29.3}
        , {"bacteria": "klebsiella sp.", "compound": "cotrimoxazole", "level": 12.7}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "piperacillin/tazobactam", "level": 14.5}
        , {"bacteria": "klebsiella sp.", "compound": "piperacillin/tazobactam", "level": 12.3}
        , {"bacteria": "staphylococcus epidermidis", "compound": "penicillin", "level": 88.6}
        , {"bacteria": "staphylococcus aureus", "compound": "penicillin", "level": 78.7}
        , {"bacteria": "staphylococcus aureus", "compound": "vancomycin", "level": 0.1}
        , {"bacteria": "enterococcus faecalis", "compound": "tigecycline", "level": 0.1}
        , {"bacteria": "serratia sp.", "compound": "piperacillin/tazobactam", "level": 4.7}
        , {"bacteria": "staphylococcus aureus", "compound": "rifampicin", "level": 0.8}
        , {"bacteria": "staphylococcus aureus", "compound": "clindamycin", "level": 10.4}
        , {"bacteria": "staphylococcus aureus", "compound": "cotrimoxazole", "level": 2.4}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "ciprofloxacin", "level": 17.1}
        , {"bacteria": "proteus mirabilis", "compound": "amoxicillin/clavulanate", "level": 9.1}
        , {"bacteria": "staphylococcus aureus", "compound": "fusidic acid", "level": 4.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "tigecycline", "level": 0.3}
        , {"bacteria": "escherichia coli", "compound": "cefepime", "level": 8}
        , {"bacteria": "streptococcus pneumoniae", "compound": "clindamycin", "level": 13}
        , {"bacteria": "staphylococcus epidermidis", "compound": "rifampicin", "level": 5.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "vancomycin", "level": 0.1}
        , {"bacteria": "staphylococcus epidermidis", "compound": "clindamycin", "level": 37.8}
        , {"bacteria": "staphylococcus aureus", "compound": "doxycycline", "level": 5}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "cefepime", "level": 10.6}
        , {"bacteria": "serratia sp.", "compound": "cotrimoxazole", "level": 2.1}
        , {"bacteria": "citrobacter sp.", "compound": "amoxicillin/clavulanate", "level": 45.2}
        , {"bacteria": "staphylococcus aureus", "compound": "teicoplanin", "level": 0.2}
        , {"bacteria": "proteus mirabilis", "compound": "cefepime", "level": 1.1}
        , {"bacteria": "citrobacter sp.", "compound": "cotrimoxazole", "level": 3.6}
        , {"bacteria": "enterococcus faecalis", "compound": "doxycycline", "level": 74.1}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "ceftazidime", "level": 11.5}
        , {"bacteria": "proteus vulgaris", "compound": "fosfomycin", "level": 14}
        , {"bacteria": "enterococcus faecalis", "compound": "penicillin", "level": 4.3}
        , {"bacteria": "morganella sp.", "compound": "nitrofurantoin", "level": 97.3}
        , {"bacteria": "acinetobacter sp.", "compound": "piperacillin/tazobactam", "level": 26.5}
        , {"bacteria": "staphylococcus aureus", "compound": "tigecycline", "level": 0}
        , {"bacteria": "enterococcus faecalis", "compound": "vancomycin", "level": 0.1}
        , {"bacteria": "serratia sp.", "compound": "amoxicillin/clavulanate", "level": 97.6}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cotrimoxazole", "level": 5.8}
        , {"bacteria": "proteus mirabilis", "compound": "piperacillin/tazobactam", "level": 1.7}
        , {"bacteria": "proteus mirabilis", "compound": "nitrofurantoin", "level": 99.6}
        , {"bacteria": "enterobacter sp.", "compound": "cefepime", "level": 6.8}
        , {"bacteria": "citrobacter sp.", "compound": "fosfomycin", "level": 1.6}
        , {"bacteria": "klebsiella sp.", "compound": "fosfomycin", "level": 28.2}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "teicoplanin", "level": 1.6}
        , {"bacteria": "streptococcus pneumoniae", "compound": "cotrimoxazole", "level": 14.8}
        , {"bacteria": "enterococcus faecium", "compound": "linezolid", "level": 0.3}
        , {"bacteria": "staphylococcus epidermidis", "compound": "teicoplanin", "level": 12.4}
        , {"bacteria": "serratia sp.", "compound": "cefepime", "level": 1}
        , {"bacteria": "enterococcus faecium", "compound": "vancomycin", "level": 1.4}
        , {"bacteria": "morganella sp.", "compound": "piperacillin/tazobactam", "level": 7.3}
        , {"bacteria": "enterobacter sp.", "compound": "piperacillin/tazobactam", "level": 22.7}
        , {"bacteria": "morganella sp.", "compound": "cotrimoxazole", "level": 16.7}
        , {"bacteria": "escherichia coli", "compound": "tigecycline", "level": 0.6}
        , {"bacteria": "serratia sp.", "compound": "fosfomycin", "level": 31.9}
        , {"bacteria": "citrobacter sp.", "compound": "cefepime", "level": 2}
        , {"bacteria": "morganella sp.", "compound": "amoxicillin/clavulanate", "level": 97.6}
        , {"bacteria": "proteus vulgaris", "compound": "amoxicillin/clavulanate", "level": 13.8}
        , {"bacteria": "haemophilus influenzae", "compound": "azithromycin", "level": 47.1}
        , {"bacteria": "citrobacter sp.", "compound": "piperacillin/tazobactam", "level": 12}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "linezolid", "level": 0.8}
        , {"bacteria": "morganella sp.", "compound": "cefepime", "level": 2}
        , {"bacteria": "enterobacter sp.", "compound": "amoxicillin/clavulanate", "level": 97.5}
        , {"bacteria": "staphylococcus epidermidis", "compound": "linezolid", "level": 0.2}
        , {"bacteria": "proteus vulgaris", "compound": "nitrofurantoin", "level": 99.5}
        , {"bacteria": "haemophilus influenzae", "compound": "amoxicillin/clavulanate", "level": 11.2}
        , {"bacteria": "streptococcus pneumoniae", "compound": "cefuroxime axetil", "level": 2.3}
        , {"bacteria": "proteus mirabilis", "compound": "tigecycline", "level": 98.5}
        , {"bacteria": "enterococcus faecalis", "compound": "linezolid", "level": 0.6}
        , {"bacteria": "haemophilus ducreyi", "compound": "erithromycin", "level": 1.2}
        , {"bacteria": "enterobacter sp.", "compound": "fosfomycin", "level": 42}
        , {"bacteria": "burkholderia sp.", "compound": "cefepime", "level": 0}
        , {"bacteria": "streptococcus pneumoniae", "compound": "doxycycline", "level": 15.7}
        , {"bacteria": "enterobacter sp.", "compound": "tigecycline", "level": 10}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "penicillin", "level": 87}
        , {"bacteria": "enterococcus faecium", "compound": "penicillin", "level": 86.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "fusidic acid", "level": 79.7}
        , {"bacteria": "streptococcus pneumoniae", "compound": "penicillin", "level": 9.4}
        , {"bacteria": "proteus vulgaris", "compound": "cotrimoxazole", "level": 13.2}
        , {"bacteria": "proteus vulgaris", "compound": "piperacillin/tazobactam", "level": 2.8}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "levofloxacin", "level": 18.5}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "vancomycin", "level": 0}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "rifampicin", "level": 0.3}
        , {"bacteria": "acinetobacter sp.", "compound": "cefepime", "level": 17.8}
        , {"bacteria": "morganella sp.", "compound": "fosfomycin", "level": 98.7}
        , {"bacteria": "serratia sp.", "compound": "nitrofurantoin", "level": 98.1}
        , {"bacteria": "acinetobacter sp.", "compound": "cotrimoxazole", "level": 15.7}
        , {"bacteria": "proteus vulgaris", "compound": "cefepime", "level": 1.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "doxycycline", "level": 9.5}
        , {"bacteria": "proteus vulgaris", "compound": "tigecycline", "level": 72.6}
        , {"bacteria": "citrobacter sp.", "compound": "tigecycline", "level": 3.4}
        , {"bacteria": "haemophilus influenzae", "compound": "cotrimoxazole", "level": 23.6}
        , {"bacteria": "enterococcus faecium", "compound": "doxycycline", "level": 25.3}
        , {"bacteria": "salmonella sp.", "compound": "cotrimoxazole", "level": 8.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "clindamycin", "level": 10.4}
        , {"bacteria": "mycobacterium tuberculosis", "compound": "rifampicin", "level": 3}
        , {"bacteria": "morganella sp.", "compound": "tigecycline", "level": 67.2}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "tigecycline", "level": 0}
        , {"bacteria": "serratia sp.", "compound": "tigecycline", "level": 22.9}
        , {"bacteria": "staphylococcus aureus", "compound": "cefuroxime axetil", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "amoxicillin", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "cefazolin", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "flucloxacillin", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "penicillin g", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "piperacillin/tazobactam", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "cefuroxime", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "ceftriaxone", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "imipenem", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "penicillin v", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "amoxicillin/clavulanate", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "ceftazidime", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "cefotaxime", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "ertapenem", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "meropenem", "level": 9.4}
        , {"bacteria": "staphylococcus aureus", "compound": "cefepime", "level": 9.4}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cefuroxime axetil", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "amoxicillin", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cefazolin", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "flucloxacillin", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "penicillin g", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "piperacillin/tazobactam", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cefuroxime", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "ceftriaxone", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "imipenem", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "penicillin v", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "amoxicillin/clavulanate", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "ceftazidime", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cefotaxime", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "ertapenem", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "meropenem", "level": 54.9}
        , {"bacteria": "staphylococcus epidermidis", "compound": "cefepime", "level": 54.9}
        , {"bacteria": "enterococcus faecalis", "compound": "gentamicin", "level": 21.4}
        , {"bacteria": "enterococcus faecalis", "compound": "tobramycin", "level": 21.4}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cefuroxime axetil", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "amoxicillin", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cefazolin", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "flucloxacillin", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "penicillin g", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "piperacillin/tazobactam", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cefuroxime", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "ceftriaxone", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "imipenem", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "penicillin v", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "amoxicillin/clavulanate", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "ceftazidime", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cefotaxime", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "ertapenem", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "meropenem", "level": 35.9}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "cefepime", "level": 35.9}
        , {"bacteria": "enterococcus faecium", "compound": "gentamicin", "level": 53.4}
        , {"bacteria": "enterococcus faecium", "compound": "tobramycin", "level": 53.4}
        , {"bacteria": "escherichia coli", "compound": "cefuroxime axetil", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "amoxicillin", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "cefazolin", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "flucloxacillin", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "penicillin g", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "cefuroxime", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "ceftriaxone", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "imipenem", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "penicillin v", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "ceftazidime", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "cefotaxime", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "ertapenem", "level": 59.1}
        , {"bacteria": "escherichia coli", "compound": "meropenem", "level": 59.1}
        , {"bacteria": "enterobacter sp.", "compound": "cefuroxime axetil", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "amoxicillin", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "cefazolin", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "flucloxacillin", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "penicillin g", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "cefuroxime", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "ceftriaxone", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "imipenem", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "penicillin v", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "ceftazidime", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "cefotaxime", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "ertapenem", "level": 12.5}
        , {"bacteria": "enterobacter sp.", "compound": "meropenem", "level": 12.5}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cefuroxime axetil", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "amoxicillin", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cefazolin", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "flucloxacillin", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "penicillin g", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "piperacillin/tazobactam", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cefuroxime", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "ceftriaxone", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "imipenem", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "penicillin v", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "amoxicillin/clavulanate", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "ceftazidime", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cefotaxime", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "ertapenem", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "meropenem", "level": 22.3}
        , {"bacteria": "staphylococcus saprophyticus", "compound": "cefepime", "level": 22.3}
        , {"bacteria": "klebsiella sp.", "compound": "cefuroxime axetil", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "amoxicillin", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "cefazolin", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "flucloxacillin", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "penicillin g", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "cefuroxime", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "ceftriaxone", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "imipenem", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "penicillin v", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "ceftazidime", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "cefotaxime", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "ertapenem", "level": 43.3}
        , {"bacteria": "klebsiella sp.", "compound": "meropenem", "level": 43.3}
        , {"bacteria": "haemophilus influenzae", "compound": "clarithromycin", "level": 73.8}
        , {"bacteria": "enterococcus faecalis", "compound": "fosfomycin", "level": 60.9}
        , {"bacteria": "shigella sp.", "compound": "cotrimoxazole", "level": 83.4}
        , {"bacteria": "neisseria gonorrhoeae", "compound": "doxycycline", "level": 60}
        , {"bacteria": "neisseria gonorrhoeae", "compound": "cefuroxime axetil", "level": 0.2}
        , {"bacteria": "campylobacter sp.", "compound": "erithromycin", "level": 15}
        , {"bacteria": "citrobacter sp.", "compound": "cefuroxime axetil", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "amoxicillin", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "cefazolin", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "flucloxacillin", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "penicillin g", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "cefuroxime", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "ceftriaxone", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "imipenem", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "penicillin v", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "ceftazidime", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "cefotaxime", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "ertapenem", "level": 14}
        , {"bacteria": "citrobacter sp.", "compound": "meropenem", "level": 14}
        , {"bacteria": "stenotrophomonas maltophilia", "compound": "minocycline", "level": 2.1}
        , {"bacteria": "proteus mirabilis", "compound": "cefuroxime axetil", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "amoxicillin", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "cefazolin", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "flucloxacillin", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "penicillin g", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "cefuroxime", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "ceftriaxone", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "imipenem", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "penicillin v", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "ceftazidime", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "cefotaxime", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "ertapenem", "level": 10.5}
        , {"bacteria": "proteus mirabilis", "compound": "meropenem", "level": 10.5}
        , {"bacteria": "neisseria gonorrhoeae", "compound": "penicillin", "level": 78}
        , {"bacteria": "morganella sp.", "compound": "cefuroxime axetil", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "amoxicillin", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "cefazolin", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "flucloxacillin", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "penicillin g", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "cefuroxime", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "ceftriaxone", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "imipenem", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "penicillin v", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "ceftazidime", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "cefotaxime", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "ertapenem", "level": 6.2}
        , {"bacteria": "morganella sp.", "compound": "meropenem", "level": 6.2}
        , {"bacteria": "neisseria meningitidis", "compound": "rifampicin", "level": 1.5}
        , {"bacteria": "serratia sp.", "compound": "cefuroxime axetil", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "amoxicillin", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "cefazolin", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "flucloxacillin", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "penicillin g", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "cefuroxime", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "ceftriaxone", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "imipenem", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "penicillin v", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "ceftazidime", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "cefotaxime", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "ertapenem", "level": 3}
        , {"bacteria": "serratia sp.", "compound": "meropenem", "level": 3}
        , {"bacteria": "neisseria meningitidis", "compound": "penicillin", "level": 38.6}
        , {"bacteria": "burkholderia sp.", "compound": "cotrimoxazole", "level": 0}
        , {"bacteria": "proteus vulgaris", "compound": "cefuroxime axetil", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "amoxicillin", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "cefazolin", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "flucloxacillin", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "penicillin g", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "cefuroxime", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "ceftriaxone", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "imipenem", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "penicillin v", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "ceftazidime", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "cefotaxime", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "ertapenem", "level": 6.1}
        , {"bacteria": "proteus vulgaris", "compound": "meropenem", "level": 6.1}
        , {"bacteria": "enterococcus faecium", "compound": "fosfomycin", "level": 45}
        , {"bacteria": "burkholderia sp.", "compound": "nitrofurantoin", "level": 60}
        , {"bacteria": "salmonella sp.", "compound": "cefuroxime axetil", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "amoxicillin", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "cefazolin", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "flucloxacillin", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "penicillin g", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "piperacillin/tazobactam", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "cefuroxime", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "ceftriaxone", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "imipenem", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "penicillin v", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "amoxicillin/clavulanate", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "ceftazidime", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "cefotaxime", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "ertapenem", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "meropenem", "level": 0}
        , {"bacteria": "salmonella sp.", "compound": "cefepime", "level": 0}
        , {"bacteria": "acinetobacter sp.", "compound": "cefuroxime axetil", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "amoxicillin", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "cefazolin", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "flucloxacillin", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "penicillin g", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "cefuroxime", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "ceftriaxone", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "imipenem", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "penicillin v", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "amoxicillin/clavulanate", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "ceftazidime", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "cefotaxime", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "ertapenem", "level": 50}
        , {"bacteria": "acinetobacter sp.", "compound": "meropenem", "level": 50}
        , {"bacteria": "burkholderia sp.", "compound": "amoxicillin/clavulanate", "level": 72.7}
        , {"bacteria": "burkholderia sp.", "compound": "piperacillin/tazobactam", "level": 0}
        , {"bacteria": "burkholderia sp.", "compound": "fosfomycin", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "cefuroxime axetil", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "amoxicillin", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "cefazolin", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "flucloxacillin", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "penicillin g", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "cefuroxime", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "ceftriaxone", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "imipenem", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "penicillin v", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "amoxicillin/clavulanate", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "cefotaxime", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "ertapenem", "level": 0}
        , {"bacteria": "pseudomonas aeruginosa", "compound": "meropenem", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "cefuroxime axetil", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "amoxicillin", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "cefazolin", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "flucloxacillin", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "penicillin g", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "piperacillin/tazobactam", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "cefuroxime", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "ceftriaxone", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "imipenem", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "penicillin v", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "amoxicillin/clavulanate", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "ceftazidime", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "cefotaxime", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "ertapenem", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "meropenem", "level": 0}
        , {"bacteria": "shigella sp.", "compound": "cefepime", "level": 0}
    ];
})();
