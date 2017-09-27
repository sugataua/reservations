const resourceRoute = require('./resources.js');
const reservationRoute = require('./reservations.js');

module.exports = function(app, db) {
    resourceRoute(app, db);
    reservationRoute(app, db);
};