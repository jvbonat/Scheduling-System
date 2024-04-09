const mongoose = require('mongoose');
const appointment = require('../models/Appointment');
const appointmentFactory = require('../factories/AppointmentFactory');
const mailer = require('nodemailer');

const Appo = mongoose.model('Appointment',appointment);

class AppointmentService {
    async create (name,email,description,cpf,date,time) {
        const newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished : false,
            notified : false
        });
        try {
            await newAppo.save();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getAll (showFinished) {
        if (showFinished) { //MOSTRA TODAS CONSULTAS, INCLUSIVE TODAS FINALIZADAS
            return await Appo.find();
        } else {
            const appos = await Appo.find({'finished':false});
            const appointments = [];
            appos.forEach(appointment=>{
                if (appointment.date) {
                    appointments.push(appointmentFactory.build(appointment));
                }
            });
            return appointments;
        }
    }

    //Query => email ou cpf
    async search(query) {
        try {
            const appos = await Appo.find().or([{ email: query }, { cpf: query }]);
            console.log(appos);
            return appos;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async getById(id) {
        try {
            const event =  Appo.findOne({'_id':id});
            return event;
        } catch (error) {
            console.log(error);
        }
    }

    async finish(id) {
        try {
            await Appo.findByIdAndUpdate(id,{'finished':true});
            return true
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async sendNotification() {
        const appos = await this.getAll(false);
        const transporter = mailer.createTransport({
            host : "sandbox.smtp.mailtrap.io",
            port : 25,
            auth : {
                user : "683b7b823c53d2",
                pass : "ea323572857f60"
            }
        });
        appos.forEach(async appo=>{
            const date = appo.start.getTime();
            const hour = 1000 * 60 * 60;
            const gap = date - Date.now();
            if (gap <= hour) {
                if(!appo.notified) {
                    await Appo.findByIdAndUpdate(appo._id,{notified:true})
                    transporter.sendMail({
                        from : "Victor Lima <victor@guia.com.br>",
                        to : appo.email,
                        subject : "Sua consulta vai acontecer em breve",
                        text : 'Sua consulta vai acontecer em 1h'
                    }).then(()=>{

                    }).catch(error=>{

                    })
                }
            }
        });
    }
}
module.exports = new AppointmentService();