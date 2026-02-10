import { Router } from "express";
import { createNewSizesBulk } from "../../controllers/admin/sizeControllers.js";

const sizeRouter = Router();

// api_endpoint: /api/admin/size
sizeRouter.post("/", createNewSizesBulk);

export default sizeRouter;
