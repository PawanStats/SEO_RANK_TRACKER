import { rankTracker } from './rankTrackerService.js';

/**
 * Service to execute rank tracking automation, format results, and update keyword tracking history metrics.
 * @param {Object} tracking - The Mongoose document instance representing the active keyword tracking record.
 * @returns {Object} - The tracking update process result object.
 */
export async function keywordTracking(tracking) {
    let result;

    try {
        console.log(`🚀 Starting keyword tracking service for: "${tracking.keyword}"`);
        
        // 1. Try up to 2 times for ultimate execution reliability against structural network blockades
        for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`   📍 Attempt ${attempt}/2...`);
            result = await rankTracker(tracking.keyword, tracking.domain);
            console.log(`   Result:`, result);
            
            // Break early if successful and valid public SERP data nodes have been extracted safely
            if (result.success && result.data.totalResultsScanned > 0) {
                console.log(`   ✅ Attempt ${attempt} successful!`);
                break;
            }

            // If the first attempt misses, implement variable exponential cooling delays before retrying
            if (attempt < 2) {
                console.log(`   ⏳ Waiting before retry...`);
                await new Promise((resolve) => 
                    setTimeout(resolve, result.success ? 3000 : 5000)
                );
            }
        }

        // 2. Synthesize results block and calculate delta metrics matrix on successful tracking operations
        if (result.success) {
            const previousPosition = tracking.currentPosition;
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize time signatures to strictly keep tracking records daily

            console.log(`📊 Result received for "${tracking.keyword}":`, {
                position: result.data.position,
                page: result.data.page,
                totalScanned: result.data.totalResultsScanned
            });

            // Bind newly extracted viewport positions back into database document states
            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            tracking.competitors = result.data.competitors;
            tracking.lastChecked = new Date();
            tracking.status = 'completed';

            // Calculate positive/negative positional variance delta steps [02:43:07]
            tracking.positionChange = (previousPosition && result.data.position) 
                ? (previousPosition - result.data.position) 
                : 0;

            // Track lifetime best historical position benchmarks accurately
            if (result.data.position && 
                (!tracking.bestPosition || result.data.position < tracking.bestPosition)) {
                tracking.bestPosition = result.data.position;
            }

            // 3. Document Daily History Log Matrix Mapping Updates [02:44:44]
            const historyEntry = {
                date: today,
                position: result.data.position,
                page: result.data.page,
                title: result.data.title,
                snippet: result.data.snippet
            };

            // Locate if a history record already exists for the current day signature entry
            const idx = tracking.rankHistory.findIndex(
                (history) => new Date(history.date).toDateString() === today.toDateString()
            );

            if (idx >= 0) {
                // Overwrite the localized log entry if multiple checks run on the exact same date framework
                tracking.rankHistory[idx] = historyEntry;
            } else {
                // Otherwise push a fresh entry node point inside the structural array history stack
                tracking.rankHistory.push(historyEntry);
            }

        } else {
            // Flag failures elegantly within collection models if processing routes time out entirely
            tracking.status = 'failed';
        }

        // 4. Persistence Phase - Commit changes safely back to database schemas
        await tracking.save();
        console.log(`💾 Tracking saved successfully for "${tracking.keyword}":`, {
            currentPosition: tracking.currentPosition,
            currentPage: tracking.currentPage,
            status: tracking.status
        });
        return result;

    } catch (error) {
        console.error("Keyword Ranking Document Synchronization Pipeline Error:", error.message);
        
        tracking.status = 'failed';
        await tracking.save().catch(() => {});
        
        return {
            success: false,
            error: error.message
        };
    }
}