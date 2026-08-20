import {Router} from 'express';
import { getCsrfToken } from '../controllers/csrf.controller.js';

const csrfRoutes = Router();
csrfRoutes.get("/token",getCsrfToken);

export default csrfRoutes;