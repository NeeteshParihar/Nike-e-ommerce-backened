import { Router } from "express";
import { createNewColorsBulk } from "../../controllers/admin/colorControllers.js";


const colorRouter = Router();

// api_endpoint: /api/admin/color
colorRouter.post("/", createNewColorsBulk);

export default colorRouter;
