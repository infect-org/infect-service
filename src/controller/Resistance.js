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
          {"bacteria":"escherichia coli","compound":"amoxicillin/clavulanate","samples":249621,"level":20.2}
        , {"bacteria":"escherichia coli","compound":"cotrimoxazole","samples":231633,"level":26.7}
        , {"bacteria":"escherichia coli","compound":"fosfomycin","samples":159001,"level":1.8}
        , {"bacteria":"klebsiella sp.","compound":"tigecycline","samples":3362,"level":14.1}
        , {"bacteria":"klebsiella sp.","compound":"cefepime","samples":42068,"level":6.6}
        , {"bacteria":"enterococcus faecium","compound":"tigecycline","samples":2544,"level":0}
        , {"bacteria":"escherichia coli","compound":"nitrofurantoin","samples":187978,"level":2.6}
        , {"bacteria":"enterobacter sp.","compound":"cotrimoxazole","samples":19965,"level":5.5}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cotrimoxazole","samples":3388,"level":1.8}
        , {"bacteria":"escherichia coli","compound":"piperacillin/tazobactam","samples":205531,"level":9.4}
        , {"bacteria":"staphylococcus epidermidis","compound":"cotrimoxazole","samples":37701,"level":35.5}
        , {"bacteria":"citrobacter sp.","compound":"nitrofurantoin","samples":7261,"level":24.6}
        , {"bacteria":"staphylococcus aureus","compound":"linezolid","samples":41491,"level":0.1}
        , {"bacteria":"klebsiella sp.","compound":"nitrofurantoin","samples":29270,"level":56.3}
        , {"bacteria":"enterobacter sp.","compound":"nitrofurantoin","samples":9614,"level":66.8}
        , {"bacteria":"proteus mirabilis","compound":"cotrimoxazole","samples":18247,"level":34.4}
        , {"bacteria":"klebsiella sp.","compound":"amoxicillin/clavulanate","samples":52004,"level":13.5}
        , {"bacteria":"proteus mirabilis","compound":"fosfomycin","samples":9872,"level":15.3}
        , {"bacteria":"staphylococcus epidermidis","compound":"fusidic acid","samples":26852,"level":48.1}
        , {"bacteria":"staphylococcus epidermidis","compound":"doxycycline","samples":27965,"level":29.4}
        , {"bacteria":"klebsiella sp.","compound":"cotrimoxazole","samples":47940,"level":12.7}
        , {"bacteria":"pseudomonas aeruginosa","compound":"piperacillin/tazobactam","samples":33687,"level":14.5}
        , {"bacteria":"klebsiella sp.","compound":"piperacillin/tazobactam","samples":43347,"level":12.3}
        , {"bacteria":"staphylococcus epidermidis","compound":"penicillin","samples":33507,"level":88.6}
        , {"bacteria":"staphylococcus aureus","compound":"penicillin","samples":71849,"level":78.7}
        , {"bacteria":"staphylococcus aureus","compound":"vancomycin","samples":61883,"level":0.1}
        , {"bacteria":"enterococcus faecalis","compound":"tigecycline","samples":7123,"level":0.1}
        , {"bacteria":"serratia sp.","compound":"piperacillin/tazobactam","samples":6597,"level":4.7}
        , {"bacteria":"staphylococcus aureus","compound":"rifampicin","samples":74917,"level":0.8}
        , {"bacteria":"staphylococcus aureus","compound":"clindamycin","samples":78563,"level":10.4}
        , {"bacteria":"staphylococcus aureus","compound":"cotrimoxazole","samples":73335,"level":2.4}
        , {"bacteria":"pseudomonas aeruginosa","compound":"ciprofloxacin","samples":35569,"level":17.1}
        , {"bacteria":"proteus mirabilis","compound":"amoxicillin/clavulanate","samples":19607,"level":9.1}
        , {"bacteria":"staphylococcus aureus","compound":"fusidic acid","samples":62884,"level":4.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"tigecycline","samples":9059,"level":0.3}
        , {"bacteria":"escherichia coli","compound":"cefepime","samples":194852,"level":8}
        , {"bacteria":"streptococcus pneumoniae","compound":"clindamycin","samples":3666,"level":12.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"rifampicin","samples":35357,"level":5.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"vancomycin","samples":32118,"level":0.1}
        , {"bacteria":"staphylococcus epidermidis","compound":"clindamycin","samples":34132,"level":37.8}
        , {"bacteria":"staphylococcus aureus","compound":"doxycycline","samples":62416,"level":5}
        , {"bacteria":"pseudomonas aeruginosa","compound":"cefepime","samples":33214,"level":10.6}
        , {"bacteria":"serratia sp.","compound":"cotrimoxazole","samples":6825,"level":2.1}
        , {"bacteria":"citrobacter sp.","compound":"amoxicillin/clavulanate","samples":13145,"level":45.2}
        , {"bacteria":"staphylococcus aureus","compound":"teicoplanin","samples":49155,"level":0.2}
        , {"bacteria":"proteus mirabilis","compound":"cefepime","samples":15329,"level":1.1}
        , {"bacteria":"citrobacter sp.","compound":"cotrimoxazole","samples":12403,"level":3.6}
        , {"bacteria":"enterococcus faecalis","compound":"doxycycline","samples":9353,"level":74}
        , {"bacteria":"pseudomonas aeruginosa","compound":"ceftazidime","samples":33593,"level":11.6}
        , {"bacteria":"proteus vulgaris","compound":"fosfomycin","samples":2060,"level":14}
        , {"bacteria":"enterococcus faecalis","compound":"penicillin","samples":11202,"level":4.4}
        , {"bacteria":"morganella sp.","compound":"nitrofurantoin","samples":3188,"level":97.3}
        , {"bacteria":"acinetobacter sp.","compound":"piperacillin/tazobactam","samples":2858,"level":26.5}
        , {"bacteria":"staphylococcus aureus","compound":"tigecycline","samples":20000,"level":0}
        , {"bacteria":"enterococcus faecalis","compound":"vancomycin","samples":24278,"level":0.1}
        , {"bacteria":"serratia sp.","compound":"amoxicillin/clavulanate","samples":6954,"level":97.6}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cotrimoxazole","samples":3144,"level":5.8}
        , {"bacteria":"proteus mirabilis","compound":"piperacillin/tazobactam","samples":16290,"level":1.7}
        , {"bacteria":"proteus mirabilis","compound":"nitrofurantoin","samples":11760,"level":99.6}
        , {"bacteria":"enterobacter sp.","compound":"cefepime","samples":17362,"level":6.8}
        , {"bacteria":"citrobacter sp.","compound":"fosfomycin","samples":6582,"level":1.7}
        , {"bacteria":"klebsiella sp.","compound":"fosfomycin","samples":26778,"level":28.2}
        , {"bacteria":"staphylococcus saprophyticus","compound":"teicoplanin","samples":2476,"level":1.6}
        , {"bacteria":"streptococcus pneumoniae","compound":"cotrimoxazole","samples":4282,"level":14.7}
        , {"bacteria":"enterococcus faecium","compound":"linezolid","samples":6105,"level":0.3}
        , {"bacteria":"staphylococcus epidermidis","compound":"teicoplanin","samples":19939,"level":12.4}
        , {"bacteria":"serratia sp.","compound":"cefepime","samples":6148,"level":1}
        , {"bacteria":"enterococcus faecium","compound":"vancomycin","samples":7896,"level":1.4}
        , {"bacteria":"morganella sp.","compound":"piperacillin/tazobactam","samples":5095,"level":7.3}
        , {"bacteria":"enterobacter sp.","compound":"piperacillin/tazobactam","samples":18707,"level":22.7}
        , {"bacteria":"morganella sp.","compound":"cotrimoxazole","samples":5562,"level":16.6}
        , {"bacteria":"escherichia coli","compound":"tigecycline","samples":9437,"level":0.6}
        , {"bacteria":"serratia sp.","compound":"fosfomycin","samples":2264,"level":31.9}
        , {"bacteria":"citrobacter sp.","compound":"cefepime","samples":10724,"level":2}
        , {"bacteria":"morganella sp.","compound":"amoxicillin/clavulanate","samples":5738,"level":97.6}
        , {"bacteria":"proteus vulgaris","compound":"amoxicillin/clavulanate","samples":4996,"level":13.8}
        , {"bacteria":"haemophilus influenzae","compound":"azithromycin","samples":1598,"level":47.3}
        , {"bacteria":"citrobacter sp.","compound":"piperacillin/tazobactam","samples":11146,"level":12.1}
        , {"bacteria":"staphylococcus saprophyticus","compound":"linezolid","samples":1691,"level":0.8}
        , {"bacteria":"morganella sp.","compound":"cefepime","samples":4850,"level":2}
        , {"bacteria":"enterobacter sp.","compound":"amoxicillin/clavulanate","samples":20479,"level":97.5}
        , {"bacteria":"staphylococcus epidermidis","compound":"linezolid","samples":18439,"level":0.2}
        , {"bacteria":"proteus vulgaris","compound":"nitrofurantoin","samples":2510,"level":99.5}
        , {"bacteria":"haemophilus influenzae","compound":"amoxicillin/clavulanate","samples":7294,"level":11.2}
        , {"bacteria":"streptococcus pneumoniae","compound":"cefuroxime axetil","samples":4195,"level":2.3}
        , {"bacteria":"proteus mirabilis","compound":"tigecycline","samples":1313,"level":98.5}
        , {"bacteria":"enterococcus faecalis","compound":"linezolid","samples":15408,"level":0.6}
        , {"bacteria":"haemophilus ducreyi","compound":"erithromycin","samples":5488,"level":1.2}
        , {"bacteria":"enterobacter sp.","compound":"fosfomycin","samples":8404,"level":42}
        , {"bacteria":"burkholderia sp.","compound":"cefepime","samples":9,"level":0}
        , {"bacteria":"streptococcus pneumoniae","compound":"doxycycline","samples":3455,"level":15.6}
        , {"bacteria":"enterobacter sp.","compound":"tigecycline","samples":1986,"level":9.9}
        , {"bacteria":"staphylococcus saprophyticus","compound":"penicillin","samples":2838,"level":87}
        , {"bacteria":"enterococcus faecium","compound":"penicillin","samples":2733,"level":86.4}
        , {"bacteria":"staphylococcus saprophyticus","compound":"fusidic acid","samples":2083,"level":79.7}
        , {"bacteria":"streptococcus pneumoniae","compound":"penicillin","samples":6133,"level":9.4}
        , {"bacteria":"proteus vulgaris","compound":"cotrimoxazole","samples":4471,"level":13.2}
        , {"bacteria":"proteus vulgaris","compound":"piperacillin/tazobactam","samples":4282,"level":2.7}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"levofloxacin","samples":1545,"level":18.5}
        , {"bacteria":"staphylococcus saprophyticus","compound":"vancomycin","samples":2580,"level":0}
        , {"bacteria":"staphylococcus saprophyticus","compound":"rifampicin","samples":2311,"level":0.3}
        , {"bacteria":"acinetobacter sp.","compound":"cefepime","samples":3047,"level":17.8}
        , {"bacteria":"morganella sp.","compound":"fosfomycin","samples":2912,"level":98.7}
        , {"bacteria":"serratia sp.","compound":"nitrofurantoin","samples":2627,"level":98.1}
        , {"bacteria":"acinetobacter sp.","compound":"cotrimoxazole","samples":3937,"level":15.7}
        , {"bacteria":"proteus vulgaris","compound":"cefepime","samples":4183,"level":1.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"doxycycline","samples":2119,"level":9.5}
        , {"bacteria":"proteus vulgaris","compound":"tigecycline","samples":339,"level":72.3}
        , {"bacteria":"citrobacter sp.","compound":"tigecycline","samples":797,"level":3.4}
        , {"bacteria":"haemophilus influenzae","compound":"cotrimoxazole","samples":4846,"level":23.6}
        , {"bacteria":"enterococcus faecium","compound":"doxycycline","samples":2336,"level":25.3}
        , {"bacteria":"salmonella sp.","compound":"cotrimoxazole","samples":1079,"level":8.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"clindamycin","samples":2161,"level":10.5}
        , {"bacteria":"mycobacterium tuberculosis","compound":"rifampicin","samples":913,"level":3}
        , {"bacteria":"morganella sp.","compound":"tigecycline","samples":535,"level":67.1}
        , {"bacteria":"staphylococcus saprophyticus","compound":"tigecycline","samples":509,"level":0}
        , {"bacteria":"serratia sp.","compound":"tigecycline","samples":585,"level":22.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"flucloxacillin","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"penicillin g","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"amoxicillin/clavulanate","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"cefuroxime axetil","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"aztreonam","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"meropenem","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"penicillin v","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"cefuroxime","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"ertapenem","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"ceftazidime","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"imipenem","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"piperacillin/tazobactam","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"ceftriaxone","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"amoxicillin","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"cefazolin","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"cefepime","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"cefotaxime","samples":28107,"level":54.9}
        , {"bacteria":"staphylococcus aureus","compound":"flucloxacillin","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"penicillin g","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"amoxicillin/clavulanate","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"cefuroxime axetil","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"aztreonam","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"meropenem","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"penicillin v","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"cefuroxime","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"ertapenem","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"ceftazidime","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"imipenem","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"piperacillin/tazobactam","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"ceftriaxone","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"amoxicillin","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"cefazolin","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"cefepime","samples":60672,"level":9.4}
        , {"bacteria":"staphylococcus aureus","compound":"cefotaxime","samples":60672,"level":9.4}
        , {"bacteria":"escherichia coli","compound":"aztreonam","samples":28424,"level":29.7}
        , {"bacteria":"klebsiella sp.","compound":"aztreonam","samples":6233,"level":28.4}
        , {"bacteria":"enterococcus faecalis","compound":"gentamicin","samples":7202,"level":21.4}
        , {"bacteria":"enterococcus faecalis","compound":"tobramycin","samples":7202,"level":21.4}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"flucloxacillin","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"penicillin g","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"amoxicillin/clavulanate","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cefuroxime axetil","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"aztreonam","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"meropenem","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"penicillin v","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cefuroxime","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"ertapenem","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"ceftazidime","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"imipenem","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"piperacillin/tazobactam","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"ceftriaxone","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"amoxicillin","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cefazolin","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cefepime","samples":357,"level":35.9}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cefotaxime","samples":357,"level":35.9}
        , {"bacteria":"enterococcus faecium","compound":"gentamicin","samples":2342,"level":53.4}
        , {"bacteria":"enterococcus faecium","compound":"tobramycin","samples":2342,"level":53.4}
        , {"bacteria":"escherichia coli","compound":"flucloxacillin","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"penicillin g","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"cefuroxime axetil","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"meropenem","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"penicillin v","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"cefuroxime","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"ertapenem","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"ceftazidime","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"imipenem","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"ceftriaxone","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"amoxicillin","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"cefazolin","samples":6478,"level":59.1}
        , {"bacteria":"escherichia coli","compound":"cefotaxime","samples":6478,"level":59.1}
        , {"bacteria":"enterobacter sp.","compound":"aztreonam","samples":3519,"level":34.5}
        , {"bacteria":"morganella sp.","compound":"aztreonam","samples":919,"level":9.1}
        , {"bacteria":"enterobacter sp.","compound":"flucloxacillin","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"penicillin g","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"cefuroxime axetil","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"meropenem","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"penicillin v","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"cefuroxime","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"ertapenem","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"ceftazidime","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"imipenem","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"ceftriaxone","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"amoxicillin","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"cefazolin","samples":393,"level":12.5}
        , {"bacteria":"enterobacter sp.","compound":"cefotaxime","samples":393,"level":12.5}
        , {"bacteria":"proteus mirabilis","compound":"aztreonam","samples":2445,"level":3.9}
        , {"bacteria":"staphylococcus saprophyticus","compound":"flucloxacillin","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"penicillin g","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"amoxicillin/clavulanate","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cefuroxime axetil","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"aztreonam","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"meropenem","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"penicillin v","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cefuroxime","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"ertapenem","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"ceftazidime","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"imipenem","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"piperacillin/tazobactam","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"ceftriaxone","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"amoxicillin","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cefazolin","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cefepime","samples":2372,"level":22.3}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cefotaxime","samples":2372,"level":22.3}
        , {"bacteria":"serratia sp.","compound":"aztreonam","samples":1231,"level":2.8}
        , {"bacteria":"klebsiella sp.","compound":"flucloxacillin","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"penicillin g","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"cefuroxime axetil","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"meropenem","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"penicillin v","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"cefuroxime","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"ertapenem","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"ceftazidime","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"imipenem","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"ceftriaxone","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"amoxicillin","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"cefazolin","samples":1048,"level":43.3}
        , {"bacteria":"klebsiella sp.","compound":"cefotaxime","samples":1048,"level":43.3}
        , {"bacteria":"citrobacter sp.","compound":"aztreonam","samples":1448,"level":21.9}
        , {"bacteria":"haemophilus influenzae","compound":"clarithromycin","samples":875,"level":73.9}
        , {"bacteria":"enterococcus faecalis","compound":"fosfomycin","samples":1437,"level":61}
        , {"bacteria":"shigella sp.","compound":"cotrimoxazole","samples":169,"level":83.4}
        , {"bacteria":"neisseria gonorrhoeae","compound":"doxycycline","samples":75,"level":60}
        , {"bacteria":"neisseria gonorrhoeae","compound":"cefuroxime axetil","samples":402,"level":0.2}
        , {"bacteria":"campylobacter sp.","compound":"erithromycin","samples":464,"level":15.1}
        , {"bacteria":"citrobacter sp.","compound":"flucloxacillin","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"penicillin g","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"cefuroxime axetil","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"meropenem","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"penicillin v","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"cefuroxime","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"ertapenem","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"ceftazidime","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"imipenem","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"ceftriaxone","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"amoxicillin","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"cefazolin","samples":229,"level":14}
        , {"bacteria":"citrobacter sp.","compound":"cefotaxime","samples":229,"level":14}
        , {"bacteria":"proteus vulgaris","compound":"aztreonam","samples":599,"level":3.8}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"minocycline","samples":527,"level":2.1}
        , {"bacteria":"proteus mirabilis","compound":"flucloxacillin","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"penicillin g","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"cefuroxime axetil","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"meropenem","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"penicillin v","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"cefuroxime","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"ertapenem","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"ceftazidime","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"imipenem","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"ceftriaxone","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"amoxicillin","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"cefazolin","samples":315,"level":10.5}
        , {"bacteria":"proteus mirabilis","compound":"cefotaxime","samples":315,"level":10.5}
        , {"bacteria":"neisseria gonorrhoeae","compound":"penicillin","samples":344,"level":77.9}
        , {"bacteria":"morganella sp.","compound":"flucloxacillin","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"penicillin g","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"cefuroxime axetil","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"meropenem","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"penicillin v","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"cefuroxime","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"ertapenem","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"ceftazidime","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"imipenem","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"ceftriaxone","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"amoxicillin","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"cefazolin","samples":130,"level":6.2}
        , {"bacteria":"morganella sp.","compound":"cefotaxime","samples":130,"level":6.2}
        , {"bacteria":"neisseria meningitidis","compound":"rifampicin","samples":66,"level":1.5}
        , {"bacteria":"serratia sp.","compound":"flucloxacillin","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"penicillin g","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"cefuroxime axetil","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"meropenem","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"penicillin v","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"cefuroxime","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"ertapenem","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"ceftazidime","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"imipenem","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"ceftriaxone","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"amoxicillin","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"cefazolin","samples":100,"level":3}
        , {"bacteria":"serratia sp.","compound":"cefotaxime","samples":100,"level":3}
        , {"bacteria":"neisseria meningitidis","compound":"penicillin","samples":88,"level":38.6}
        , {"bacteria":"burkholderia sp.","compound":"cotrimoxazole","samples":11,"level":0}
        , {"bacteria":"proteus vulgaris","compound":"flucloxacillin","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"penicillin g","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"cefuroxime axetil","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"meropenem","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"penicillin v","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"cefuroxime","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"ertapenem","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"ceftazidime","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"imipenem","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"ceftriaxone","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"amoxicillin","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"cefazolin","samples":115,"level":6.1}
        , {"bacteria":"proteus vulgaris","compound":"cefotaxime","samples":115,"level":6.1}
        , {"bacteria":"enterococcus faecium","compound":"fosfomycin","samples":40,"level":45}
        , {"bacteria":"burkholderia sp.","compound":"nitrofurantoin","samples":5,"level":60}
        , {"bacteria":"salmonella sp.","compound":"flucloxacillin","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"penicillin g","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"amoxicillin/clavulanate","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"cefuroxime axetil","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"aztreonam","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"meropenem","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"penicillin v","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"cefuroxime","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"ertapenem","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"ceftazidime","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"imipenem","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"piperacillin/tazobactam","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"ceftriaxone","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"amoxicillin","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"cefazolin","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"cefepime","samples":20,"level":0}
        , {"bacteria":"salmonella sp.","compound":"cefotaxime","samples":20,"level":0}
        , {"bacteria":"acinetobacter sp.","compound":"flucloxacillin","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"penicillin g","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"amoxicillin/clavulanate","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"cefuroxime axetil","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"aztreonam","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"meropenem","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"penicillin v","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"cefuroxime","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"ertapenem","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"ceftazidime","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"imipenem","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"ceftriaxone","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"amoxicillin","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"cefazolin","samples":2,"level":50}
        , {"bacteria":"acinetobacter sp.","compound":"cefotaxime","samples":2,"level":50}
        , {"bacteria":"burkholderia sp.","compound":"amoxicillin/clavulanate","samples":11,"level":72.7}
        , {"bacteria":"burkholderia sp.","compound":"piperacillin/tazobactam","samples":9,"level":0}
        , {"bacteria":"burkholderia sp.","compound":"fosfomycin","samples":3,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"flucloxacillin","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"penicillin g","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"amoxicillin/clavulanate","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"cefuroxime axetil","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"aztreonam","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"meropenem","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"penicillin v","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"cefuroxime","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"ertapenem","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"imipenem","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"ceftriaxone","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"amoxicillin","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"cefazolin","samples":1,"level":0}
        , {"bacteria":"pseudomonas aeruginosa","compound":"cefotaxime","samples":1,"level":0}
        , {"bacteria":"burkholderia sp.","compound":"aztreonam","samples":2,"level":0}
        , {"bacteria":"shigella sp.","compound":"flucloxacillin","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"penicillin g","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"amoxicillin/clavulanate","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"cefuroxime axetil","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"aztreonam","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"meropenem","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"penicillin v","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"cefuroxime","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"ertapenem","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"ceftazidime","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"imipenem","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"piperacillin/tazobactam","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"ceftriaxone","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"amoxicillin","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"cefazolin","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"cefepime","samples":3,"level":0}
        , {"bacteria":"shigella sp.","compound":"cefotaxime","samples":3,"level":0}

    ];
})();
