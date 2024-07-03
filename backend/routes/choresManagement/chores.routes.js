import express from 'express';

import { addChore, completeChore, getChores, generateSecretKey, deleteChore} from '../../controllers/chores.controller.js';

const router = express.Router();

router.post('/generateSecretKey', generateSecretKey);
router.post('/add', addChore);
router.get('/:userId', getChores);
router.put('/:choreId', completeChore);
router.delete('/:choreId', deleteChore);

export default router;