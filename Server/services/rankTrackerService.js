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

/**
 * Search Google for a keyword and extract the accurate ranking result for a target domain.
 * @param {string} keyword - The targeted SEO search phrase.
 * @param {string} targetDomain - The target domain name to check ranking for.
 * @returns {Object} - An object detailing the crawl success state, position matrix, and competitor overview.
 */
export async function rankTracker(keyword, targetDomain) {
    return trackingQueue.add(() => rankTrackerInternal(keyword, targetDomain));
}

async function rankTrackerInternal(keyword, targetDomain) {
    let browser;
    let session;
    const allResults = [];
    let found = null;

    try {
        console.log(`   🌐 Creating Browserbase session for: "${keyword}"`);
        
        // 1. Initialize Cloud Browserbase Session & handle ad-blocking filters
        session = await Promise.race([
            bb.sessions.create({
                browserSettings: {
                    blockAds: true
                }
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Session creation timeout after 30s')), 30000)
            )
        ]);

        console.log(`   ✅ Session created: ${session.id}`);
        console.log(`   📦 Session properties:`, Object.keys(session));

        // Connect to Browserbase session correctly
        const connectUrl = session.connectUrl || session.url || session.wsUrl;
        if (!connectUrl) {
            throw new Error(`Cannot find connection URL in session object. Available: ${Object.keys(session).join(', ')}`);
        }
        
        console.log(`   🔗 Connecting to: ${connectUrl.substring(0, 50)}...`);
        
        browser = await chromium.connect(connectUrl);
        
        console.log(`   ✅ Connected to browser`);
        
        const context = await browser.createContext();
        const page = await context.newPage();
        page.setDefaultNavigationTimeout(45000);

        // 2. Initial Google landing navigation & structural verification
        await page.goto('https://www.google.com', { waitUntil: 'networkidle' });

        // Try-Catch intercept block to bypass localized cookie / consent prompts securely
        try {
            const btn = await page.$("button[id], form[action*='consent'] button");
            if (btn) {
                await btn.click();
                await page.waitForTimeout(1500);
            }
        } catch (consentError) {
            // No localized consent prompt intercepted; proceed safely to crawl phase.
        }

        // Clean target string boundaries for optimized indexing operations
        const cleanTarget = targetDomain.replace('www.', '').toLowerCase().trim();

        // 3. Main Query Loop: Scan through up to 5 Google SERP compilation nodes (top 50 results)
        for (let GPage = 0; GPage < 5; GPage++) {
            if (found) break; // Break early if matching ranking positions are uncovered

            const startIndex = GPage * 10;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${startIndex}&num=10&hl=en&gl=us`;
            
            await page.goto(searchUrl, { waitUntil: 'networkidle' });

            // 4. Dom Node Parsing & Structural Data Extraction Retry Mechanism
            let pageResults = [];
            for (let retry = 0; retry < 3; retry++) {
                try {
                    await page.waitForSelector('h3', { timeout: 8000 });
                    await page.waitForTimeout(1500);

                    // Deconstruct standard search list matrices dynamically from runtime viewport contextual boundaries
                    pageResults = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll('h3')).map(h3 => {
                            let a = h3.closest('a');
                            if (!a) {
                                let p = h3.parentElement;
                                for (let j = 0; j < 5; j++) {
                                    if (p && p.tagName === 'A') {
                                        a = p;
                                        break;
                                    }
                                    if (p) p = p.parentElement;
                                }
                            }

                            if (!a || !a.href || !a.href.startsWith('http') || a.href.includes('google.com')) {
                                return null;
                            }

                            // Dynamic parsing traversal tree to isolate the associated meta-description/snippet cleanly
                            let snippet = '';
                            let container = a.parentElement;
                            for (let j = 0; j < 6; j++) {
                                if (!container) break;
                                const innerText = container.innerText || '';
                                if (innerText.length > (h3.innerText || '').length + 50) {
                                    snippet = innerText
                                        .split('\n')
                                        .find(l => l.length > 30 && !l.includes(h3.innerText.substring(0, 20))) || '';
                                    break;
                                }
                                container = container.parentElement;
                            }

                            try {
                                const parsedUrl = new URL(a.href);
                                return {
                                    url: a.href,
                                    domain: parsedUrl.hostname.replace('www.', ''),
                                    title: h3.innerText.trim(),
                                    snippet: snippet.trim().substring(0, 300)
                                };
                            } catch {
                                return null;
                            }
                        }).filter(Boolean);
                    });

                    if (pageResults.length > 0) break;
                } catch (selectorError) {
                    if (retry === 2) break;
                    await page.reload({ waitUntil: 'networkidle' });
                }
            }

            if (pageResults.length === 0) break;

            // 5. Compute Synthesized Positional Metrics & Cross-Match Against Target Boundary Identifiers
            for (const r of pageResults) {
                r.position = allResults.length + 1;
                allResults.push(r);

                const currentDomain = r.domain.toLowerCase();
                if (!found && (currentDomain.includes(cleanTarget) || cleanTarget.includes(currentDomain))) {
                    found = { ...r, page: GPage + 1 };
                }
            }

            // Anti-bot mitigation spacing algorithms
            await page.waitForTimeout(2000 + Math.random() * 2000);
        }

        // 6. Graceful Session Termination & Competitor Mapping Matrix Synthesis
        if (browser) {
            try {
                await browser.close();
                console.log(`   🔌 Browser closed successfully`);
            } catch (closeError) {
                console.error(`   ⚠️  Error closing browser:`, closeError.message);
            }
        }

        // Isolate domain instances to extract and format direct competitive ranking data cleanly
        const competitors = allResults
            .filter(r => !r.domain.toLowerCase().includes(cleanTarget) && !cleanTarget.includes(r.domain.toLowerCase()))
            .slice(0, 10);

        const responseData = {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found ? found.position : null,
                page: found ? found.page : null,
                title: found ? found.title : '',
                snippet: found ? found.snippet : '',
                competitors,
                totalResultsScanned: allResults.length
            }
        };

        return responseData;

    } catch (error) {
        console.error("❌ Rank Check Core Automation Pipeline Exception:", error.message);
        console.error("   Stack:", error.stack?.split('\n')[0]);
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        // ALWAYS cleanup browser properly
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