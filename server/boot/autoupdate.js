/* eslint-disable strict,max-len,spaced-comment */
module.exports = function (app) {
    var path = require('path');
    var models = require(path.resolve(__dirname, '../model-config.json'));
    var datasources = require(path.resolve(__dirname, '../datasources.json'));

    function autoUpdateAll() {
        Object.keys(models).forEach(function (key) {
            if (typeof models[key].dataSource != 'undefined') {
                if (typeof datasources[models[key].dataSource] != 'undefined') {
                    app.dataSources[models[key].dataSource].autoupdate(key, function (err) {
                        if (err) {
                            console.log("============= key =============");
                            console.log(key);
                            throw err
                        }
                        console.log('Model ' + key + ' updated');
                    });
                }
            }
        });
    }

    function autoMigrateAll() {
        Object.keys(models).forEach(function (key) {
            if (typeof models[key].dataSource != 'undefined') {
                if (typeof datasources[models[key].dataSource] != 'undefined') {
                    app.dataSources[models[key].dataSource].automigrate(key, function (err) {
                        if (err) throw err;
                        console.log('Model ' + key + ' migrated');
                    });
                }
            }
        });
    }

    // TODO: change to autoUpdateAll when ready for CI deployment to production
    // autoMigrateAll();
   // autoUpdateAll();
};
  /**
* Created by Alpha on 2019-08-02.
*/