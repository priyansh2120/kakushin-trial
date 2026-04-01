import express from 'express';
import { userDetails, getAllUsers } from '../../controllers/extras.controller.js';
import protectRoute from '../../middleware/protectRoute.js';

const router = express.Router();

router.get('/alluser/search', getAllUsers);
router.get('/:userId', protectRoute, userDetails);

export default router;