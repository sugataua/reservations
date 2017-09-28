var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {

    // Read list of records
    app.get('/api/reservations', (req, res) => {
        
        var cursor = db.collection('reservations')
                        .aggregate([
                            { $lookup:
                                {
                                    from: 'resources',
                                    localField: 'resource_id',
                                    foreignField: '_id',
                                    as: 'resources_list'
                                }
                            }
                        ], (err, result) => {
                            if (err) {
                                console.log(err);
                            }
                            
                            //result = JSON.stringify(result);
                            //console.log(result);  
                            res.send(result);                      
                        });

    });

    // Read single record
    app.get('/api/reservations/:id', (req, res) => {
        const id = req.params.id;
        var filterParams;
        try {
            filterParams = {'_id': new ObjectID(id) };
        } catch(Error){
            res.status(400).send("Bad request");
            return;
        }
        
        db.collection('reservations').findOne(filterParams, (err, result) => {            
            if (err) {
                console.log(err);
                res.status(500).send({'message':'Internal error'});
            } else {
                if (result !== null) {
                    res.send(result);
                } else {
                    res.status(404).send( { message:'Not Found!' } );
                }                 
            }
        });
    });


    // POST
    app.post('/api/reservations', (req, res) => {
        console.log('');
        console.log('Begin time: ' + Date(req.body.begin));
        console.log('End time: ' + Date(req.body.end));
        const new_resource = {
            resource_id: new ObjectID(req.body.resource_id),
            begin: new Date(req.body.begin),
            end: new Date(req.body.end),
            user: req.body.user,
            createdAt: new Date()
        };
        //console.log(req.body);
        console.log(' ');
        console.log('New document:' + new_resource);
        
        db.collection('reservations').insert(new_resource, (err, result) => {
            if (err) {
                res.send({'error':'An error has occured'});
            } else {
                res.send(result.ops[0]);
            }
        });    
    });




    // DELETE
    app.delete('/api/reservations/:id', (req, res) => {
        const id = req.params.id;
        var filterParams;
        try {
            filterParams = {'_id': new ObjectID(id) };
        } catch(Error){
            res.status(400).send("Bad request");
            return;
        }
        db.collection('reservations').remove(filterParams, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({
                    'message':'An error has occured'
                });
            } else {                
                if (result !== null) {
                    res.send('Reservation ' + id + ' is deleted!');
                } else {
                    res.status(404).send('Not Found');
                }      
            }
        });
    });
};