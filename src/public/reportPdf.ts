import * as fs from "fs";
import path from "path";
import lighthouse from "lighthouse";


export const getReportPDF = async (
    result: { lhr: any },
    metricId: string,
    url: string
  ): Promise<{ publicUrlRapport: string; publicUrlJsonRapport: string }>=> {
  
    const ReportGenerator = require("lighthouse/report/generator/report-generator");
    const downloadsDir = path.join(process.cwd(), 'Downloads');
    console.log(" write file in  =", downloadsDir);

    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }
    //partie html
    const reportHtml = ReportGenerator.ReportGenerator.generateReport(result.lhr, "html");
    const cleanUrl = url.replace(/[^\w]/g, "_").substring(0, 100);
    const reportFilename = `lighthouse-report-${cleanUrl}-${metricId}.html`;

    const filePath = path.join(downloadsDir, reportFilename);
    console.log(" NOM COMPLET DU FICHIER HTML =", filePath);
    fs.writeFileSync(filePath, reportHtml);
    console.log(`Rapport sauvegardé : ${filePath}`);
    
      // === JSON ===
  const reportJson = JSON.stringify(result.lhr, null, 2);
  const reportJsonName = `lighthouse-report-${cleanUrl}-${metricId}.json`;
  const reportJsonPath = path.join(downloadsDir, reportJsonName);
  fs.writeFileSync(reportJsonPath, reportJson);

    //  URL publique (accessible depuis le frontend)
    const publicUrlRapport = `/reports/${reportFilename}`
    const publicUrlJsonRapport = `/reports/${reportJsonName}`
    return {publicUrlRapport , publicUrlJsonRapport}

}