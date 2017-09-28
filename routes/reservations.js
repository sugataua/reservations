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

        function hasCorrectBody(data) {
            var properties = ['resource_id', 'begin', 'end', 'user'];

            for (var i=0; i<properties.length; i++) {
                if (!data.hasOwnProperty(properties[i])) {
                    return false;
                }
                return true;
            };

        };
        
        if (hasCorrectBody(req.body)) {
            console.log('Data is correct');
            const new_resource = {
                resource_id: new ObjectID(req.body.resource_id),
                begin: new Date(req.body.begin),
                end: new Date(req.body.end),
                user: req.body.user,
                createdAt: new Date()
            };
            //console.log(req.body);
            //console.log(' ');
            //console.log('New document:' + new_resource);
            
            db.collection('reservations').insert(new_resource, (err, result) => {
                if (err) {
                    res.status(500).send({'message':'Internal error'});
                } else {
                    res.send({
                        message: "Reservation successfuly created!",  
                        reservation: result.ops[0]
                    });
                }
            });
        } else {
            console.log('Data is not CORRECT!');
            res.status(400).send({
                message: "Bad Request!"                
            });
        }
        

            
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