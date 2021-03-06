import Sequelize from 'sequelize';

import mongoose from 'mongoose';
import databaseConfig from '../config/database';
 
import User from '../app/models/User';
import File from '../app/models/File';
import Appointments from '../app/models/Appointments'

const models = [ User, File, Appointments];

 
class Database{
    constructor(){
        this.init();
        this.mongo();
    }

    init(){
        this.connection = new Sequelize(databaseConfig);

        models
            .map( model => model.init(this.connection))
            .map( model => model.associate && model.associate(this.connection.models))
    }

    mongo(){
         this.mongoConnection = mongoose.connect(
             'mongodb+srv://diogostack:150398@cluster0-n6rfd.mongodb.net/test?retryWrites=true&w=majority',
             {
                useNewUrlParser: true,
                useFindAndModify: true,
                useUnifiedTopology: true,
            }
         )
    }
}

export default new Database();