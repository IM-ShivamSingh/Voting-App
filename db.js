const mongoose=require('mongoose');
require('dotenv').config();

//define the mongodb connection url
const mongoURL=process.env.mongoURL_local
//const mongoURL=process.env.mongoURL

//setup monodb connection
mongoose.connect(mongoURL,{
    //   useNewUrlParser:true,
    //   useUnifiedTopology:true
})

//get the default connection
const db=mongoose.connection;


//event listener for database connection
db.on('connected',()=>{
    console.log('connected to mongodb server')
})
db.on('error',(err)=>{
    console.log('connection error:',err);
})
db.on('disconnected',()=>{
    console.log('mongodb disconnected');
})
module.exports=db;