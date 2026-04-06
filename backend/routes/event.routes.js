import express from 'express';
import { ingestEvent } from '../controllers/event.controllers.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { attachUserIfPresent } from '../middleware/auth.js';
import { ingestEventSchema } from '../validation/requestSchemas.js';

const router = express.Router();

router.post('/', attachUserIfPresent, validateRequest(ingestEventSchema), ingestEvent);

export default router;
