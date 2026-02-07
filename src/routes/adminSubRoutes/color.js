import { Router } from "express";
import { createNewColor } from "../../controllers/admin/colorControllers.js";


const colorRouter = Router();

// api_endpoint: /api/admin/color
colorRouter.post("/", createNewColor);

export default colorRouter;
