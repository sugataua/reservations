
var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    
    
    // Read list of records
    app.get('/api/resources', (req, res) => {
                
        // var cursor = db.collection('resources').find({}).toArray((err, result) => {
        //     if (err) {
        //         console.log(err);
        //         throw err;
        //     }
        //     console.log(result);
        //     res.send(result);
        // });

        var cursor = db.collection('resources')
                        .aggregate([
                            { $lookup:
                                {
                                    from: 'reservations',
                                    localField: '_id',
                                    foreignField: 'resource_id',
                                    as: 'reservationslist'
                                }
                            }
                        ], (err, result) => {
                            if (err) {
                                console.log(err);
                            }
                            //result = JSON.stringify(result);
                            //console.log('Result:');
                            //console.log(result);  
                            //res.send([]);
                            res.send(result);                      
                            
        });


        
    });
    
    
    // Read single record
    app.get('/api/resources/:id', (req, res) => {
        const id = req.params.id;
        var filterParams;
        try {
            filterParams = {'_id': new ObjectID(id) };
        } catch(Error){
            res.status(400).send("Bad request");
            return;
        }
        
        db.collection('resources').findOne(filterParams, (err, result) => {            
            if (err) {
                console.log(err);
                res.status(500).send({'message':'Internal error!'});
                //console.log('FindOne result:');
                //console.log(result);
            } else {
                if (result !== null) {
                    res.send(result);
                } else {
                    res.status(404).send({ message: 'Not Found!'});
                }                 
            }
        });
    });





    // POST
    app.post('/api/resources', (req, res) => {
        if (!('name' in req.body)) {
            res.status(400)
                .send({
                    message: "Bad Request",
                    details: "Field 'name' is required"
                });
        }
        const new_resource = {
                        name: req.body.name,
                        description: req.body.description,
                        createdAt: new Date()
        };
        //console.log(req.body);
        db.collection('resources').insert(new_resource, (err, result) => {
            if (err) {
                res.status(500).send({
                    'message': 'Server error has occured'
                });
            } else {
                res.send({
                    message: "Resource successfuly created!",
                    resource: result.ops[0],                    
                });
            }
        });    
    });


    // DELETE
    app.delete('/api/resources/:id', (req, res) => {
        const id = req.params.id;
        var filterParams;
        
        try {
            filterParams = {'_id': new ObjectID(id) };
        } catch(Error){
            res.status(400).send({message: "Bad request"});
            return;
        }
        db.collection('resources').deleteOne(filterParams, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({'message':'Internal error'});
            } else {  
                            
                if (result.deletedCount === 1) {
                    res.send({message: 'Resource successfuly deleted!'});
                } else {
                    res.status(404).send({message: 'Not Found!'});
                }      
            }
        });
    });


    // UPDATE
    app.put('/api/resources/:id', (req, res) => {
        const id = req.params.id;
        var filterParams;
        try {
            filterParams = {'_id': new ObjectID(id) };
        } catch(Error){
            res.status(400).send({
                message: "Bad Request!"
            });
            return;
        }
        
        const changedResource = {'name': req.body.name, 'description' : req.body.description };
        var newValues = { $set: changedResource };
        db.collection('resources').updateOne(filterParams, newValues, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500)
                    .send({
                        message:'Server error'
                    });
            } else {
                
                if (result.matchedCount > 0) {
                    res.send({
                        message: "Resource updated!",
                        resource: changedResource
                    });
                } else {
                    res.status(404).send({
                        message: 'Not Found!'
                    });
                }                 
            }
        });
    });
};