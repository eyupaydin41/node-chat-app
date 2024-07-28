/* eslint-disable no-undef */
    const mongoose = require('mongoose');

    let instance = null;

    class Database { 

        constructor() {
            if (instance === null) {   
                this.connectDB(); 
                instance = this;
            }
            return instance;
        }
        
        connectDB = async () => {
            try {
                await mongoose.connect(process.env.CONNECTION_STRING);
                console.log('MongoDB connected');
            } catch (err) {
                console.error(err.message);
                process.exit(1);        
            }
        };
    }

    const dbInstance = new Database();
    Object.freeze(dbInstance);

    module.exports = dbInstance; 