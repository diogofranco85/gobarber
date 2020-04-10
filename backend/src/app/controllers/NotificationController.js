import User from '../models/User';
import Notifications from '../schemas/Notifications';

class NotificationController{

    async index(req, res){

        const checkIsProvider = await User.findOne({
            where:{
                provider: true,
                id: req.userid
            }
        })

        if(!checkIsProvider){
            return res.status(400).json({ error: 'Only provider can load notifications'});
        }

        const notifications = await Notifications.find({
            user: req.userid,
        })
        .sort({createdAt: 'desc'})
        .limit(20);

        return res.json(notifications);

    }

    async update(req, res){

        const notifications = await Notifications.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        )

        return res.json(notifications);

    }

}

export default new NotificationController();