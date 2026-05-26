import axios from 'axios';
import { load } from 'cheerio';

export async function scrapeUrl(urlString) {
    try {
        // Validate URL
        const urlObj = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
        const finalUrl = urlObj.href;

        // Fetch the website with timeout
        const startTime = Date.now();
        const response = await axios.get(finalUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 5
        });
        const loadTime = Date.now() - startTime;

        // Parse HTML with Cheerio
        const $ = load(response.data);

        // Extract meta data
        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';
        const canonical = $('link[rel="canonical"]').attr('href') || '';
        const robots = $('meta[name="robots"]').attr('content') || '';
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        const ogDescription = $('meta[property="og:description"]').attr('content') || '';
        const ogImage = $('meta[property="og:image"]').attr('content') || '';
        const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
        const viewport = $('meta[name="viewport"]').attr('content') || '';
        const charsetMeta = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';

        // Extract headings
        const h1Texts = [];
        $('h1').each((i, el) => {
            const text = $(el).text().trim();
            if (text) h1Texts.push(text);
        });

        const headings = {
            h1: $('h1').length,
            h2: $('h2').length,
            h3: $('h3').length,
            h4: $('h4').length,
            h5: $('h5').length,
            h6: $('h6').length,
            h1Texts
        };

        // Extract links
        let internalLinks = 0;
        let externalLinks = 0;
        const currentHost = urlObj.hostname;

        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            
            try {
                const linkUrl = new URL(href, finalUrl);
                if (linkUrl.hostname === currentHost) {
                    internalLinks++;
                } else {
                    externalLinks++;
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        });

        const links = {
            internal: internalLinks,
            external: externalLinks,
            total: internalLinks + externalLinks
        };

        // Extract images
        const images = [];
        let missingAlt = 0;
        let withAlt = 0;

        $('img').each((i, el) => {
            const alt = $(el).attr('alt');
            if (!alt || alt.trim() === '') {
                missingAlt++;
            } else {
                withAlt++;
            }
            images.push({
                src: $(el).attr('src'),
                alt: alt || ''
            });
        });

        // Extract body text and word count
        const bodyText = $('body').text() || '';
        const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
        const pageSize = response.data.length;

        const scrapedData = {
            metaData: {
                title,
                description,
                canonical,
                robots,
                ogTitle,
                ogDescription,
                ogImage,
                twitterCard,
                viewport,
                charset: charsetMeta,
            },
            headings,
            links,
            images: {
                total: images.length,
                missingAlt,
                withAlt,
                list: images.slice(0, 20) // Limit to first 20 images
            },
            wordCount,
            pageSize,
            bodyText: bodyText.substring(0, 5000), // Limit text for storage
            statusCode: response.status,
            url: finalUrl,
            loadTime
        };

        return {
            success: true,
            data: scrapedData
        };

    } catch (error) {
        console.error("[CHEERIO SCRAPER] Failed to scrape:", error.message);
        return {
            success: false,
            error: error.message || "Failed to scrape the website"
        };
    }
}
