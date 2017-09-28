process.env.NODE_ENV = 'test';

let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let config = require('config');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Resources', function(){
    beforeEach((done) => {
        MongoClient.connect(config.DBHost, function(err, db){
            if (err) console.log(err);
                       

            db.collection('resources').remove({}, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({'error':'An error has occured'});
                }
                done(); 
            });
        })
    })

    describe('/GET resources', () => {
        it('it should GET empty array when no resources', (done) => {
            chai.request(server)
                .get('/api/resources')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });

        it('it should GET all the resources', (done) => {
            MongoClient.connect(config.DBHost, function(err, db){
                if (err) throw console.log(err);
                
                
                const test_resources = [{name: "Test", description: 'req.body.description' },
                                        {name: "Test2", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' },
                                        {name: "Test", description: 'req.body.description' }                
                ];


                db.collection('resources').insertMany(test_resources, (err, result) => {
                    if (err) {
                        console.log('Error occured during insert Resourse');
                    }


                    chai.request(server)
                    .get('/api/resources')
                    .end((err, res) => {
                        
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(test_resources.length);
                        done();
                    });
                    
                });

                 
            });
        })
    });


    describe('/POST resource', () => {
        it('it should not POST a resource without name', (done) => {
            let resource = {
                description: "test"                
            };

            chai.request(server)
                .post('/api/resources')
                .send(resource)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('Bad Request');
                    res.body.should.have.property('details');
                    res.body.details.should.include('name');
                    res.body.details.should.include('required');
                    done();
                });
        });

        it('it should POST a resource', (done) => {
            let resource = {
                name: "test",
                description: "csjnkjn3uh9hn cnew9 ce9p3jcsdnc"                
            };

            chai.request(server)
                .post('/api/resources')
                .send(resource)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.message.should.include('created');
                    res.body.should.have.property('resource');
                    res.body.resource.should.have.property('name');
                    res.body.resource.should.have.property('description');
                    res.body.resource.should.have.property('createdAt');
                    res.body.resource.name.should.be.eql(resource.name);
                    res.body.resource.description.should.be.eql(resource.description);
                    
                    done();
                });
        });
    });

    describe('/GET/:id resource', () => {
        it('it should GET resource', (done) => {
            let resource = {
                name: "Meeting room Colvir",
                description: "Located on the top floor. 10 seats available."                              
            };
            MongoClient.connect(config.DBHost, function(err, db){
                if (err) console.log(err);   

                db.collection('resources').insertOne(resource, (err, result) => {
                    if (err) console.log(err);

                    chai.request(server)
                        .get('/api/resources/' + result.insertedId)
                        .end((err, res) => {
                            if (err) console.log(err);
                            
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('name').eql(resource.name);
                            res.body.should.have.property('description').eql(resource.description);
                            res.body.should.have.property('_id').eql(result.insertedId.toString());
                        done();
                        });
                });

            });

        });


        it('it should not GET resource with not existing id', (done) => {
            
            ne_id = new ObjectID();

            MongoClient.connect(config.DBHost, function(err, db){
                if (err) console.log(err);

                chai.request(server)
                    .get('/api/resources/' + ne_id)
                    .end((err, res) => {
                                                
                        res.should.have.status(404);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Not Found!');
                    done();
                    });               

            });

        });
    });


    describe('/PUT/:id resource', () => {
        it('it should not PUT resource with invalid id', (done) => {
            let resource = {
                description: "new_test"                              
            };

            chai.request(server)
                .put('/api/resources/-cdscscwd2cds')
                .send(resource)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Bad Request!');
                done();
                });
        });

        it('it should not PUT resource with not existing id', (done) => {
            let resource = {
                description: "new_test"                              
            };

            ne_id = new ObjectID();

            chai.request(server)
                .put('/api/resources/' + ne_id.toString())
                .send(resource)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Not Found!');
                done();
                })
        });


        it('it should PUT resource', (done) => {
            let resource = {
                name: "test put",
                description: "new_test"                              
            };

            MongoClient.connect(config.DBHost, function(err, db){
                if (err) throw console.log(err);    

                db.collection('resources').insertOne(resource, (err, result) => {
                    if (err) {
                        console.log('Error occured during insert Resourse');
                    }

                    
                    chai.request(server)
                        .put('/api/resources/' + result.insertedId.toString())
                        .send({
                            name: "New name",
                            description: "Description updated" })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql('Resource updated!');
                            res.body.should.have.property('resource');
                            res.body.resource.should.have.property('name').eql('New name');
                            res.body.resource.should.have.property('description').eql('Description updated');
                        done();
                        });
                });
            });
        });
    });


    describe('/DELETE/:id resource', () => {
        it('it should DELETE resource', (done) => {
            let resource = {
                name: "Meeting room Chaos",
                description: "Located on the basement floor. 12 seats available."                              
            };
            MongoClient.connect(config.DBHost, function(err, db){
                if (err) console.log(err);   

                db.collection('resources').insertOne(resource, (err, result) => {
                    if (err) console.log(err);
                    
                    chai.request(server)
                        .delete('/api/resources/' + result.insertedId)
                        .end((err, res) => {
                                                        
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql('Resource successfuly deleted!');
                            
                            
                        done();
                        });
                });

            });

        });


        it('it should not DELETE resource with not existing id', (done) => {
            
            ne_id = new ObjectID();

            MongoClient.connect(config.DBHost, function(err, db){
                if (err) console.log(err);

                chai.request(server)
                    .delete('/api/resources/' + ne_id)
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