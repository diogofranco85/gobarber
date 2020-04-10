import { Router } from 'express';
import multer from 'multer';


import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentsController from './app/controllers/AppointmentsController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';
import multerconfig from './config/multer';

const routes = new Router();
const upload = multer(multerconfig);

/*
    EM AUTENTICAÇÃO
*/
//criar usuário
routes.post('/users', UserController.store);
//login de acesso
routes.post('/sessions', SessionController.store);

/*
    ROTAS AUTENTICADAS
*/
routes.use(authMiddleware);
//upload avatar 
routes.post('/files', upload.single('file') ,FileController.store );
//alterar dados de usuário
routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);

routes.post('/appointments', AppointmentsController.store);
routes.get('/appointments', AppointmentsController.index);
routes.delete('/appointments/:id', AppointmentsController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/available', AvailableController.index);

export default routes;
