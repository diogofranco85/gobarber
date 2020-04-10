import User from '../models/User';
import File from '../models/File';
import Appointments from '../models/Appointments';
import Notification from '../schemas/Notifications';

import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours} from 'date-fns';
import pt from 'date-fns/locale/pt-BR'

import Queue from '../../lib/queue'; 
import CancellationMail from '../jobs/CancellationMail'

class AppointmentsController{

    async index(req, res){

        const { page = 1 } = req.query;
        const limit_data = 20;

        const appointment = await Appointments.findAll({
            where:{
                user_id: req.userid,
                canceled_at: null
            },
            attributes:['id','date'],
            order:['date'],
            limit: limit_data,
            offset: (page - 1) * limit_data,
            include:{
                model: User,
                as: 'provider',
                attributes:[ 'id','name'],
                include:{
                    model: File,
                    as: 'avatar',
                    attributes:['id','url','path']
                }
            }
        })

        return res.json(appointment);
    }

    async store(req, res){

        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required(),
        })

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({ error: 'Validation fails'});
        }

        const { provider_id, date } = req.body;

        if( provider_id === req.userid){
            return res.status(401).json({error: 'Provider and User cannot be the same'})
        }

        const isProvider = await User.findOne({ where: { id: provider_id, provider: true }})

        if(!isProvider){
            return res.status(401)
                    .json({ error: 'You can only create appointments with providers'})
        }   

        const HourStart = startOfHour(parseISO(date));

        if(isBefore(HourStart, new Date())){
            return res.status(400).json({ error: 'Past date are not permitted'})
        }


        
        const checkAvailability = await Appointments.findOne({
            where:{
                provider_id,
                canceled_at: null,
                date: HourStart,
            },
        });

        if(checkAvailability){
            return res.status(400).json({eror: 'Appointment date is not available'})
        }

        const appointment = await Appointments.create({
            user_id: req.userid,
            provider_id,
            date: HourStart,
        })


        const user = await User.findByPk(req.userid);
        const formattedDate = format(
            HourStart,
            "'dia' dd 'de' MMMM 'às' H:mm'h'",
            { locale: pt },
        );

        await Notification.create({
            content: `Novo agendamento de ${user.name} para ${formattedDate}`,
            user: provider_id,

        })

        return res.json(appointment);
    }

    async delete(req, res){
        const appointment = await Appointments.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'provider',
                attributes:['name', 'email']
            },
            {
                model: User,
                as: 'user',
                attributes:['name']  
            }]
        });

        if(appointment.user_id !== req.userid){
            return res.status(401).json({error: "You don't have permission to cancel this appointment"})
        }

        const dateWithSub = subHours(appointment.date, 2);

        if(isBefore(dateWithSub, new Date())){
            return res.status(401).json({
                error: "You can only cancel appointments 2 hours in advance"
            })
        }

        appointment.canceled_at = new Date();

        await appointment.save();

        Queue.add(CancellationMail.key, {
            appointment,
        });

        return res.json(appointment);
    }
}

export default new AppointmentsController();