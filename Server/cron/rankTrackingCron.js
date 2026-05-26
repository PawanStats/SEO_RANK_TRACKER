import cron from 'node-cron';
import KeywordTrackingModel from "../models/keywordTracking.js";
import { keywordTracking as runTrackingService } from "../services/keywordTrackingService.js";

export function startRankTrackingCron() {
    cron.schedule('0 6 * * *', async () => {    
        console.log("starting rank tracking cron job...");
        try {
            const activeTrackings = await KeywordTrackingModel.find({ active: true })
            for (const tracking of activeTrackings) {
                tracking.status = "checking";
                await tracking.save();

                const result = await runTrackingService(tracking)


                await new Promise((r) => setTimeout(r, 10000 + Math.random() * 5000))
                }
        } catch (error) {
            console.error("Error in rank tracking cron job:", error);
        }
    })
    console.log("Rank tracking cron job scheduled ")
}
                 // add random delay to avoid hitting rate limits
            