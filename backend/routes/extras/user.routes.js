import express from 'express';
import {userDetails, getAllUsers} from '../../controllers/extras.controller.js';

const router = express.Router();
router.get('/:userId', userDetails);
router.get('/alluser/search', getAllUsers);

export default router;