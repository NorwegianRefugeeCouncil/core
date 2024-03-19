import { Router } from 'express';

import { getWelcomeMessage } from '../services/welcome.service';

const router = Router();

router.get('/', async (req, res) => {
  const welcomeMessage = getWelcomeMessage();
  res.send(welcomeMessage);
});

export { router as welcomeRouter };
