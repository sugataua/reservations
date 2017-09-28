process.env.NODE_ENV = 'test';

let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let config = require('config');

let server = require('../server');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();


chai.use(chaiHttp);

describe('Reservations', function() {
    beforeEach((done) => {
        MongoClient.connect(config.DBHost, function(err, db){
            if (err) console.log(err);
            
            // Clear collection before Test
            db.collection('reservations').remove({}, (err, result) => {
                if (err) {
                    console.log(err);
                    
                }
                done(); 
            });
        });
    });

    describe('/GET list of reservations', () => {
        it('it should GET emty array when no reservations', (done) => {
            chai.request(server)
                .get('/api/reservations')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                done();
                });
        });
        
        it('it should GET all reservations', (done) => {
            MongoClient.connect(config.DBHost, function(err, db){
                if (err) throw console.log(err);
                                
                const resource = {name: "Test", description: 'req.body.description' };


                db.collection('resources').insertOne(resource, (err, result) => {
                    if (err) {
                        console.log('Error occured during insert Resourse');
                    }

                    const test_reservations = [
                        {
                            resource_id: new ObjectID(result.insertedId),
                            begin: new Date(),
                            end: new Date(),
                            user: "Name Surname"
                        },
                        {
                            resource_id: new ObjectID(result.insertedId),
                            begin: new Date(),
                            end: new Date(),
                            user: "Name Surname"
                        },
                        {
                            resource_id: new ObjectID(result.insertedId),
                            begin: new Date(),
                            end: new Date(),
                            user: "Name Surname"
                        },
                        {
                            resource_id: new ObjectID(result.insertedId),
                            begin: new Date(),
                            end: new Date(),
                            user: "Name Surname"
                        },
                    ];
                    
                    db.collection('reservations').insertMany(test_reservations, (err, result) => {
                        if (err) {
                            console.log('Error occured during insert Resourse');
                        }
    
                        chai.request(server)
                        .get('/api/reservations')
                        .end((err, res) => {
                            
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(test_reservations.length);
                            done();
                        });

                    });

                });
                 
            });
        }); // it
        
    });

    describe('/GET/:id reservation', () => {
        it('it should GET reservation', (done) => {
            const resource = {
                name: "Meeting room Colvir",
                description: "Located on the top floor. 10 seats available."                              
            };

            
            MongoClient.connect(config.DBHost, function(err, db){
                if (err) console.log(err);   

                db.collection('resources').insertOne(resource, (err, result) => {
                    if (err) console.log(err);


                    const reservation = {
                        resource_id: new ObjectID(result.insertedId),
                        begin: new Date(),
                        end: new Date(),
                        user: "Name Surname"
                    };

                    db.collection('reservations').insertOne(reservation, (err, result_inner) => {
                        if (err) console.log(err);

                        chai.request(server)
                            .get('/api/reservations/' + result_inner.insertedId.toString())
                            .end((err, res) => {
                                if (err) console.log(err);
                                
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.have.property('resource_id').eql(reservation.resource_id.toString());
                                res.body.should.have.property('begin');
                                res.body.should.have.property('end');
                                res.body.should.have.property('user').eql(reservation.user);
                                res.body.should.have.property('_id').eql(result_inner.insertedId.toString());
                            done();
                            });

                    });
                });

            });

        });


        it('it should not GET reservation with not existing id', (done) => {
            
            ne_id = new ObjectID();

            MongoClient.connect(config.DBHost, function(err, db){
                if (err) console.log(err);

                chai.request(server)
                    .get('/api/reservations/' + ne_id)
                    .end((err, res) => {
                                                
                        res.should.have.status(404);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Not Found!');
                    done();
                    });               

            });

        });
    });

});