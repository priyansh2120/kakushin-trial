import express from 'express';

import { addChore, completeChore, getChores, generateSecretKey, deleteChore} from '../../controllers/chores.controller.js';
import protectRoute from '../../middleware/protectRoute.js';

const router = express.Router();

router.post('/generateSecretKey', protectRoute, generateSecretKey);
router.post('/add', protectRoute, addChore);
router.get('/:userId', protectRoute, getChores);
router.put('/:choreId', protectRoute, completeChore);
router.delete('/:choreId', protectRoute, deleteChore);

export default router;