import { Request, Response, Router } from 'express';

const router: Router = Router();

router.get('/', (req: Request, resp: Response): Response => {
  return resp.status(200);
});

export default router;
