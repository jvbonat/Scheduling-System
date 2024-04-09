const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.static('public'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.set('view engine','ejs');
const appointmentService = require("./services/AppointmentService");

mongoose.connect("mongodb://127.0.0.1:27017/agendamento",{useNewUrlParser:true,useUnifiedTopology:true});

app.get("/",(req,res)=>{
    res.render('index');
});

app.get('/cadastro',(req,res)=>{
    res.render('create');
})

app.listen(8080,()=>{
    console.log('Application running');
});

app.post("/create", async (req,res)=>{
    const status = await appointmentService.create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
        );
    if (status) {
        res.redirect("/");
    } else {
        res.send('Ocorreu um erro')
    }
});

app.get("/getcalendar",async (req,res)=>{
    const appointments = await appointmentService.getAll(false);
    res.json(appointments);
});

app.get("/event/:id",async(req,res)=>{
    const appo = await appointmentService.getById(req.params.id);
    console.log(appo);
    res.render('event',{appo:appo});
});

app.post("/finish",async(req,res)=>{
    const id = req.body.id;
    const result = await appointmentService.finish(id);
    res.redirect("/");
});

app.get("/list",async(req,res)=>{
    const appos = await appointmentService.getAll(true);
    res.render('list',{appos:appos});
});

app.get("/searchresult",async(req,res)=>{
    const appos = await appointmentService.search(req.query.search);
    res.render("list",{appos:appos});
});

const pooltime = 60 * 1000 * 5;

setInterval(async()=>{
    await appointmentService.sendNotification();
},pooltime);