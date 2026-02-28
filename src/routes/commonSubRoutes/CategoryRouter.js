
import { Router } from "express";
import { getAggregatedFilters } from "../../controllers/common/Category.js";

const categoryRouter = Router();

// api/common/category/filters/:id --> id is the parent category id
categoryRouter.get("/filters/:id",getAggregatedFilters);

export default categoryRouter;