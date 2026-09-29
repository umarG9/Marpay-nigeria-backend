const express = require('express');
const app = express();
app.get('/', (req,res)=>{res.json({message:'MarPay Live!', owner:'Umar Hadi Gwani', opay:'7012869066'})});
app.listen(process.env.PORT||5000, ()=>console.log('Live'));
