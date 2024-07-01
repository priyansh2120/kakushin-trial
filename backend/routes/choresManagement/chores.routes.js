import express from 'express';

import { addChore, completeChore, getChores, generateSecretKey} from '../../controllers/chores.controller.js';

const router = express.Router();

router.post('/generateSecretKey', generateSecretKey);
router.post('/add', addChore);
router.get('/:userId', getChores);
router.put('/:choreId', completeChore);

export default router;