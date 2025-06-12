import express from "express"; 
import {createApplication} from "../../src/controllers/AppToTestController"
import {getMetricsAverageController, saveMetrics} from "../../src/controllers/MetricsContoller"
import {getAllApplicationsController} from "../../src/controllers/AppToTestController"
import { getDetailMetricsController, getTestMetricsById, getWebVitalById } from "@src/controllers/WebVitalController";
import { getTestAppController, getTestsByMonthController, getTotalTests } from "@src/controllers/TestController";
import authorization from "@src/middleware/authorization";
import { paginateTablesController } from "@src/controllers/PaginationController";


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
