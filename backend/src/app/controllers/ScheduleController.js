import Appointments from '../models/Appointments';
import User from '../models/User';

import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

class ScheduleController{

    async index(req, res){

        const checkUserProvider = await User.findOne({
            where: {
                provider: true,
                id: req.userid,
            }
        })

        if(!checkUserProvider){
            return res.json(401).json({error: 'User is not provider'})
        }

        const { date } = req.query;
        const parsedDate = parseISO(date);

        const appointments = await Appointments.findAll({
            where:{
                provider_id: req.userid,
                canceled_at: null,
                date: {
                    [Op.between] : [
                        startOfDay(parsedDate), endOfDay(parsedDate)
                    ]
                }
            },
            order: ['date']
        })
        


        return res.status(200).json(appointments);
    }

}


export default new ScheduleController();