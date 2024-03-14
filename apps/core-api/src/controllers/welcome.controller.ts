import express from 'express';
import { getWelcomeMessage } from '../services/welcome.service';

const router = express.Router();

router.get('/', async (req, res) => {
    const welcomeMessage = getWelcomeMessage();
    res.send(welcomeMessage);
});

export default router;
