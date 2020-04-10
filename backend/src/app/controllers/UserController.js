import User from '../models/User';

import * as Yup from 'yup';

class UserController{

    async store(req, res){

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6)
        })

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Validate error'});
        }

        const userExists = await User.findOne({ where: {email: req.body.email }})

        if(userExists){
            return res.status(400).json({error: "user already exists"});
        }

        const {id, name, email, provider} = await User.create(req.body);

        return res.json({ id, name, email, provider });
    }
    
    async update(req, res){
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            oldpassword: Yup.string().required().min(6),
            password: Yup.string().min(6).when('oldpassword', (oldpassword, field) => 
                oldpassword ? field.required() : field
            ),
            confirmPassword: Yup.string().when('password', (password, field) => 
                password ? field.required().oneOf(Yup.ref('password')) : field
            )
        })

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Validate error'});
        }

        const { oldpassword, email } = req.body;
        
        const user = await User.findByPk(req.userid);

        if(email !== user.email){
            const userExists = await User.findOne({ where: {email: req.body.email }})

            if(userExists){
                return res.status(400).json({error: "user already exists"});
            }
        }
        
        if(oldpassword && !(await user.checkpassword(oldpassword))){
            return res.status(400).json({error: "Password does not match"});
        }

        const { name, id, provider } = await user.update(req.body)

        return res.json({id, name, email, provider});
    }

}

export default new UserController();