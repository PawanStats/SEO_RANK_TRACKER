import { chromium } from 'playwright-core';
import browserbase from '@browserbasehq/sdk';

// Initialize the Browserbase HQ SDK using the Cloud API Key
const bb = new browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY
});

// Queue system to prevent exceeding Browserbase concurrent session limit
class TrackingQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.processedCount = 0;
    }

    async add(trackingFn) {
        this.queue.push({ trackingFn });
        console.log(`📋 Added to queue. Queue length: ${this.queue.length}`);
        return new Promise((resolve, reject) => {
            const handler = { trackingFn, resolve, reject };
            this.queue[this.queue.length - 1] = handler;
            this.process();
        });
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        this.processedCount++;
        const { trackingFn, resolve, reject } = this.queue.shift();

        console.log(`🚀 Processing request #${this.processedCount}. Remaining in queue: ${this.queue.length}`);

        try {
            const result = await trackingFn();
            resolve(result);
        } catch (error) {
            console.error(`❌ Request #${this.processedCount} failed:`, error.message);
            reject(error);
        } finally {
            this.processing = false;
            // Add longer delay to ensure Browserbase releases the session properly
            if (this.queue.length > 0) {
                console.log(`   ⏳ Waiting 5 seconds before next tracking request...`);
                await new Promise(r => setTimeout(r, 5000));
            }
            this.process();
        }
    }
}

const trackingQueue = new TrackingQueue();

export async function rankTracker(keyword, targetDomain) {
    let browser;
    let allResults = [];
    let found = null;
    
    console.log(`🔎 Starting rank tracking for keyword: "${keyword}" on domain: ${targetDomain}`);
    console.log(`⚠️  [MOCK MODE] Browserbase API upgrade in progress - returning random data`);
    
    try {
        // Simulate processing delay
        await new Promise(r => setTimeout(r, 2000));
        
        // Generate mock results with random position
        const mockPosition = Math.floor(Math.random() * 50) + 1; // Random position between 1-50
        const mockPage = Math.ceil(mockPosition / 10); // Which Google page (1-5)
        
        // Generate mock competitors
        const mockCompetitors = Array.from({ length: 10 }, (_, i) => ({
            position: i + 1,
            url: `https://example-competitor-${i + 1}.com`,
            domain: `example-competitor-${i + 1}.com`,
            title: `Competitor Result ${i + 1} for "${keyword}"`,
            snippet: `This is a mock snippet showing competitor ranking for the keyword "${keyword}". Results are randomized until Browserbase API upgrade.`
        }));
        
        found = {
            position: mockPosition,
            page: mockPage,
            title: `Your Mock Result for "${keyword}"`,
            snippet: `Mock ranking data: Your domain is currently ranked at position ${mockPosition} for "${keyword}". This is simulated data until the Browserbase API upgrade is complete.`,
            url: `https://${targetDomain}`,
            domain: targetDomain
        };

        const responseData = {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found.position,
                page: found.page,
                title: found.title,
                snippet: found.snippet,
                competitors: mockCompetitors,
                totalResultsScanned: 50
            }
        };

        console.log(`✅ Mock rank tracking completed for "${keyword}":`, responseData.data);
        return responseData;

    } catch (error) {
        console.error("❌ Mock Rank Tracking Error:", error.message);

        return {
            success: false,
            error: error.message
        };
    } finally {
        // Cleanup if browser was used
        if (browser) {
            try {
                await browser.close();
                console.log(`   ✅ Browser closed`);
            } catch (closeError) {
                console.error(`   ⚠️  Error closing browser:`, closeError.message);
            }
        }
    }
}