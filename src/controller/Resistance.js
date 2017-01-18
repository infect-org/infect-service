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
           {"bacteria":"escherichia coli","compound":"amoxicillin/clavulanate","samples":242462,"level":19.1}
        , {"bacteria":"escherichia coli","compound":"cotrimoxazole","samples":231045,"level":26.7}
        , {"bacteria":"escherichia coli","compound":"fosfomycin","samples":158553,"level":1.8}
        , {"bacteria":"klebsiella sp.","compound":"tigecycline","samples":3356,"level":14.1}
        , {"bacteria":"klebsiella sp.","compound":"cefepime","samples":40890,"level":5.7}
        , {"bacteria":"enterococcus faecium","compound":"tigecycline","samples":2537,"level":0}
        , {"bacteria":"escherichia coli","compound":"nitrofurantoin","samples":187462,"level":2.6}
        , {"bacteria":"enterobacter sp.","compound":"cotrimoxazole","samples":19910,"level":5.5}
        , {"bacteria":"staphylococcus saprophyticus","compound":"cotrimoxazole","samples":3373,"level":1.8}
        , {"bacteria":"escherichia coli","compound":"piperacillin/tazobactam","samples":198508,"level":7.8}
        , {"bacteria":"staphylococcus epidermidis","compound":"cotrimoxazole","samples":37587,"level":35.5}
        , {"bacteria":"citrobacter sp.","compound":"nitrofurantoin","samples":7242,"level":24.5}
        , {"bacteria":"staphylococcus aureus","compound":"linezolid","samples":41381,"level":0.1}
        , {"bacteria":"klebsiella sp.","compound":"nitrofurantoin","samples":29180,"level":56.4}
        , {"bacteria":"enterobacter sp.","compound":"nitrofurantoin","samples":9589,"level":66.8}
        , {"bacteria":"proteus mirabilis","compound":"cotrimoxazole","samples":18184,"level":34.4}
        , {"bacteria":"klebsiella sp.","compound":"amoxicillin/clavulanate","samples":50793,"level":12.9}
        , {"bacteria":"proteus mirabilis","compound":"fosfomycin","samples":9847,"level":15.3}
        , {"bacteria":"staphylococcus epidermidis","compound":"fusidic acid","samples":26794,"level":48.1}
        , {"bacteria":"staphylococcus epidermidis","compound":"doxycycline","samples":27882,"level":29.4}
        , {"bacteria":"klebsiella sp.","compound":"cotrimoxazole","samples":47811,"level":12.7}
        , {"bacteria":"pseudomonas aeruginosa","compound":"piperacillin/tazobactam","samples":33587,"level":14.5}
        , {"bacteria":"klebsiella sp.","compound":"piperacillin/tazobactam","samples":42192,"level":11.5}
        , {"bacteria":"staphylococcus epidermidis","compound":"penicillin","samples":33415,"level":88.6}
        , {"bacteria":"staphylococcus aureus","compound":"penicillin","samples":71657,"level":78.7}
        , {"bacteria":"staphylococcus aureus","compound":"vancomycin","samples":61721,"level":0.1}
        , {"bacteria":"enterococcus faecalis","compound":"tigecycline","samples":7100,"level":0.1}
        , {"bacteria":"serratia sp.","compound":"piperacillin/tazobactam","samples":6475,"level":4.8}
        , {"bacteria":"staphylococcus aureus","compound":"rifampicin","samples":74694,"level":0.8}
        , {"bacteria":"staphylococcus aureus","compound":"clindamycin","samples":78355,"level":10.4}
        , {"bacteria":"staphylococcus aureus","compound":"cotrimoxazole","samples":73138,"level":2.4}
        , {"bacteria":"pseudomonas aeruginosa","compound":"ciprofloxacin","samples":35472,"level":17.1}
        , {"bacteria":"proteus mirabilis","compound":"amoxicillin/clavulanate","samples":19232,"level":9.1}
        , {"bacteria":"staphylococcus aureus","compound":"fusidic acid","samples":62692,"level":4.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"tigecycline","samples":9026,"level":0.3}
        , {"bacteria":"escherichia coli","compound":"cefepime","samples":187853,"level":6.3}
        , {"bacteria":"streptococcus pneumoniae","compound":"clindamycin","samples":3652,"level":13}
        , {"bacteria":"staphylococcus epidermidis","compound":"rifampicin","samples":35253,"level":5.9}
        , {"bacteria":"staphylococcus epidermidis","compound":"vancomycin","samples":32022,"level":0.1}
        , {"bacteria":"staphylococcus epidermidis","compound":"clindamycin","samples":34040,"level":37.8}
        , {"bacteria":"staphylococcus aureus","compound":"doxycycline","samples":62244,"level":5}
        , {"bacteria":"pseudomonas aeruginosa","compound":"cefepime","samples":33130,"level":10.6}
        , {"bacteria":"serratia sp.","compound":"cotrimoxazole","samples":6807,"level":2.1}
        , {"bacteria":"citrobacter sp.","compound":"amoxicillin/clavulanate","samples":12875,"level":45.8}
        , {"bacteria":"staphylococcus aureus","compound":"teicoplanin","samples":49035,"level":0.2}
        , {"bacteria":"proteus mirabilis","compound":"cefepime","samples":14973,"level":0.9}
        , {"bacteria":"citrobacter sp.","compound":"cotrimoxazole","samples":12366,"level":3.6}
        , {"bacteria":"enterococcus faecalis","compound":"doxycycline","samples":9329,"level":74}
        , {"bacteria":"pseudomonas aeruginosa","compound":"ceftazidime","samples":33482,"level":11.5}
        , {"bacteria":"proteus vulgaris","compound":"fosfomycin","samples":2055,"level":14}
        , {"bacteria":"enterococcus faecalis","compound":"penicillin","samples":11168,"level":4.4}
        , {"bacteria":"morganella sp.","compound":"nitrofurantoin","samples":3175,"level":97.3}
        , {"bacteria":"acinetobacter sp.","compound":"piperacillin/tazobactam","samples":2846,"level":26.5}
        , {"bacteria":"staphylococcus aureus","compound":"tigecycline","samples":19944,"level":0}
        , {"bacteria":"enterococcus faecalis","compound":"vancomycin","samples":24219,"level":0.1}
        , {"bacteria":"serratia sp.","compound":"amoxicillin/clavulanate","samples":6833,"level":99}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"cotrimoxazole","samples":3136,"level":5.8}
        , {"bacteria":"proteus mirabilis","compound":"piperacillin/tazobactam","samples":15940,"level":1.5}
        , {"bacteria":"proteus mirabilis","compound":"nitrofurantoin","samples":11725,"level":99.6}
        , {"bacteria":"enterobacter sp.","compound":"cefepime","samples":16919,"level":6.7}
        , {"bacteria":"citrobacter sp.","compound":"fosfomycin","samples":6564,"level":1.6}
        , {"bacteria":"klebsiella sp.","compound":"fosfomycin","samples":26710,"level":28.2}
        , {"bacteria":"staphylococcus saprophyticus","compound":"teicoplanin","samples":2463,"level":1.6}
        , {"bacteria":"streptococcus pneumoniae","compound":"cotrimoxazole","samples":4267,"level":14.7}
        , {"bacteria":"enterococcus faecium","compound":"linezolid","samples":6089,"level":0.3}
        , {"bacteria":"staphylococcus epidermidis","compound":"teicoplanin","samples":19888,"level":12.4}
        , {"bacteria":"serratia sp.","compound":"cefepime","samples":6028,"level":1}
        , {"bacteria":"enterococcus faecium","compound":"vancomycin","samples":7876,"level":1.4}
        , {"bacteria":"morganella sp.","compound":"piperacillin/tazobactam","samples":4948,"level":7.4}
        , {"bacteria":"enterobacter sp.","compound":"piperacillin/tazobactam","samples":18266,"level":23}
        , {"bacteria":"morganella sp.","compound":"cotrimoxazole","samples":5549,"level":16.7}
        , {"bacteria":"escherichia coli","compound":"tigecycline","samples":9414,"level":0.6}
        , {"bacteria":"serratia sp.","compound":"fosfomycin","samples":2259,"level":32}
        , {"bacteria":"citrobacter sp.","compound":"cefepime","samples":10474,"level":1.7}
        , {"bacteria":"morganella sp.","compound":"amoxicillin/clavulanate","samples":5589,"level":99.7}
        , {"bacteria":"proteus vulgaris","compound":"amoxicillin/clavulanate","samples":4870,"level":13.9}
        , {"bacteria":"haemophilus influenzae","compound":"azithromycin","samples":1592,"level":47.2}
        , {"bacteria":"citrobacter sp.","compound":"piperacillin/tazobactam","samples":10891,"level":12}
        , {"bacteria":"staphylococcus saprophyticus","compound":"linezolid","samples":1690,"level":0.8}
        , {"bacteria":"morganella sp.","compound":"cefepime","samples":4707,"level":1.9}
        , {"bacteria":"enterobacter sp.","compound":"amoxicillin/clavulanate","samples":20045,"level":99.2}
        , {"bacteria":"staphylococcus epidermidis","compound":"linezolid","samples":18385,"level":0.2}
        , {"bacteria":"proteus vulgaris","compound":"nitrofurantoin","samples":2500,"level":99.5}
        , {"bacteria":"haemophilus influenzae","compound":"amoxicillin/clavulanate","samples":7278,"level":11.3}
        , {"bacteria":"streptococcus pneumoniae","compound":"cefuroxime axetil","samples":4184,"level":2.3}
        , {"bacteria":"proteus mirabilis","compound":"tigecycline","samples":1311,"level":98.5}
        , {"bacteria":"enterococcus faecalis","compound":"linezolid","samples":15373,"level":0.6}
        , {"bacteria":"haemophilus ducreyi","compound":"erithromycin","samples":5471,"level":1.2}
        , {"bacteria":"enterobacter sp.","compound":"fosfomycin","samples":8383,"level":42}
        , {"bacteria":"burkholderia sp.","compound":"cefepime","samples":9,"level":0}
        , {"bacteria":"streptococcus pneumoniae","compound":"doxycycline","samples":3442,"level":15.6}
        , {"bacteria":"enterobacter sp.","compound":"tigecycline","samples":1980,"level":9.9}
        , {"bacteria":"staphylococcus saprophyticus","compound":"penicillin","samples":2830,"level":87}
        , {"bacteria":"enterococcus faecium","compound":"penicillin","samples":2726,"level":86.4}
        , {"bacteria":"staphylococcus saprophyticus","compound":"fusidic acid","samples":2075,"level":79.7}
        , {"bacteria":"streptococcus pneumoniae","compound":"penicillin","samples":6116,"level":9.4}
        , {"bacteria":"proteus vulgaris","compound":"cotrimoxazole","samples":4462,"level":13.2}
        , {"bacteria":"proteus vulgaris","compound":"piperacillin/tazobactam","samples":4159,"level":2.6}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"levofloxacin","samples":1542,"level":18.5}
        , {"bacteria":"staphylococcus saprophyticus","compound":"vancomycin","samples":2566,"level":0}
        , {"bacteria":"staphylococcus saprophyticus","compound":"rifampicin","samples":2306,"level":0.3}
        , {"bacteria":"acinetobacter sp.","compound":"cefepime","samples":3040,"level":17.8}
        , {"bacteria":"morganella sp.","compound":"fosfomycin","samples":2905,"level":98.7}
        , {"bacteria":"serratia sp.","compound":"nitrofurantoin","samples":2614,"level":98.1}
        , {"bacteria":"acinetobacter sp.","compound":"cotrimoxazole","samples":3927,"level":15.7}
        , {"bacteria":"proteus vulgaris","compound":"cefepime","samples":4055,"level":1.2}
        , {"bacteria":"staphylococcus saprophyticus","compound":"doxycycline","samples":2114,"level":9.5}
        , {"bacteria":"proteus vulgaris","compound":"tigecycline","samples":338,"level":72.5}
        , {"bacteria":"citrobacter sp.","compound":"tigecycline","samples":796,"level":3.4}
        , {"bacteria":"haemophilus influenzae","compound":"cotrimoxazole","samples":4838,"level":23.6}
        , {"bacteria":"enterococcus faecium","compound":"doxycycline","samples":2333,"level":25.3}
        , {"bacteria":"salmonella sp.","compound":"cotrimoxazole","samples":1076,"level":8.4}
        , {"bacteria":"staphylococcus saprophyticus","compound":"clindamycin","samples":2155,"level":10.5}
        , {"bacteria":"mycobacterium tuberculosis","compound":"rifampicin","samples":912,"level":3}
        , {"bacteria":"morganella sp.","compound":"tigecycline","samples":532,"level":67.1}
        , {"bacteria":"staphylococcus saprophyticus","compound":"tigecycline","samples":509,"level":0}
        , {"bacteria":"serratia sp.","compound":"tigecycline","samples":584,"level":22.9}
        , {"bacteria":"haemophilus influenzae","compound":"clarithromycin","samples":874,"level":73.9}
        , {"bacteria":"enterococcus faecalis","compound":"fosfomycin","samples":1434,"level":60.9}
        , {"bacteria":"shigella sp.","compound":"cotrimoxazole","samples":169,"level":83.4}
        , {"bacteria":"neisseria gonorrhoeae","compound":"doxycycline","samples":75,"level":60}
        , {"bacteria":"neisseria gonorrhoeae","compound":"cefuroxime axetil","samples":402,"level":0.2}
        , {"bacteria":"campylobacter sp.","compound":"erithromycin","samples":464,"level":15.1}
        , {"bacteria":"stenotrophomonas maltophilia","compound":"minocycline","samples":525,"level":2.1}
        , {"bacteria":"neisseria gonorrhoeae","compound":"penicillin","samples":343,"level":78.1}
        , {"bacteria":"neisseria meningitidis","compound":"rifampicin","samples":66,"level":1.5}
        , {"bacteria":"neisseria meningitidis","compound":"penicillin","samples":88,"level":38.6}
        , {"bacteria":"burkholderia sp.","compound":"cotrimoxazole","samples":11,"level":0}
        , {"bacteria":"enterococcus faecium","compound":"fosfomycin","samples":40,"level":45}
        , {"bacteria":"burkholderia sp.","compound":"nitrofurantoin","samples":5,"level":60}
        , {"bacteria":"burkholderia sp.","compound":"amoxicillin/clavulanate","samples":11,"level":72.7}
        , {"bacteria":"burkholderia sp.","compound":"piperacillin/tazobactam","samples":9,"level":0}
        , {"bacteria":"burkholderia sp.","compound":"fosfomycin","samples":3,"level":0}
    ];
})();
