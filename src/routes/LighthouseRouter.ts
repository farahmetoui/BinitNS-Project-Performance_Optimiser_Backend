import express from "express"; 
import {createApplication, getAllApplicationsController } from "../controllers/AppToTestController";
import {getMetricsAverageController, saveMetrics} from "../controllers/MetricsContoller"
import {getDetailMetricsController, getTestMetricsById, getWebVitalById } from "../controllers/WebVitalController";
import {getTestAppController, getTestsByMonthController, getTotalTests } from "../controllers/TestController";
import authorization from "../middleware/authorization";
import { paginateTablesController } from "../controllers/PaginationController";


const router = express.Router();
router.post("/getTestsNumberBymonth",authorization, getTestsByMonthController);
router.post("/getAverage",authorization, getMetricsAverageController);
router.post("/createApplication" , authorization,createApplication);
router.get("/getTestsNumber",authorization,getTotalTests);
router.post("/AddMetrics", authorization, saveMetrics);
router.post("/pagination", authorization, paginateTablesController);
router.get("/AllApplications",authorization, getAllApplicationsController);
router.get("/metrics/:appId",authorization, getDetailMetricsController);
router.get("/testApp/:appId",authorization, getTestAppController);
router.get("/webvital/:id", authorization, getWebVitalById); 
router.get("/metricsbytestid/:id",authorization, getTestMetricsById);

export default router;
