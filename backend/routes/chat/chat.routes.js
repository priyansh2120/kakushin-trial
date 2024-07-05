import express from 'express';
import { Chat } from '../../controllers/chat.controller.js';

const router = express.Router();

router.get('/', Chat);
router.post('/', Chat);

export default router