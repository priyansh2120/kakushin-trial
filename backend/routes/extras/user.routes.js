import express from 'express';
import {userDetails} from '../../controllers/extras.controller.js';

const router = express.Router();
router.get('/:userId', userDetails);

export default router;