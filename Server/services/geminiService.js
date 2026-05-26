import axios from 'axios';

export async function analyzeSeoData(scrapedData) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: "GEMINI_API_KEY not set in environment variables" };
        }

        const prompt = `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.
Website URL: ${scrapedData.url}
Load Time: ${scrapedData.loadTime}ms
Status Code: ${scrapedData.statusCode}
Page Size: ${Math.round(scrapedData.pageSize / 1024)}KB
Word Count: ${scrapedData.wordCount}

META DATA:
- Title: "${scrapedData.metaData.title}" (${scrapedData.metaData.title.length} chars)
- Description: "${scrapedData.metaData.description}" (${scrapedData.metaData.description.length} chars)
- Canonical: "${scrapedData.metaData.canonical}"
- Robots: "${scrapedData.metaData.robots}"
- OG Title: "${scrapedData.metaData.ogTitle}"
- OG Description: "${scrapedData.metaData.ogDescription}"
- OG Image: "${scrapedData.metaData.ogImage}"
- Twitter Card: "${scrapedData.metaData.twitterCard}"
- Viewport: "${scrapedData.metaData.viewport}"
- Charset: "${scrapedData.metaData.charset}"

HEADINGS:
- H1: ${scrapedData.headings.h1} (texts: ${JSON.stringify(scrapedData.headings.h1Texts)})
- H2: ${scrapedData.headings.h2}
- H3: ${scrapedData.headings.h3}
- H4: ${scrapedData.headings.h4}
- H5: ${scrapedData.headings.h5}
- H6: ${scrapedData.headings.h6}

LINKS:
- Internal: ${scrapedData.links.internal}
- External: ${scrapedData.links.external}
- Total: ${scrapedData.links.total}

IMAGES:
- Total: ${scrapedData.images.total}
- Missing Alt Text: ${scrapedData.images.missingAlt}
- With Alt Text: ${scrapedData.images.withAlt}

PAGE CONTENT (first 3000 chars):
${scrapedData.bodyText}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Provide your response ONLY as valid JSON (no markdown, no extra text) with this structure:
{
    "overallScore": number between 0-100,
    "categories": {
        "seo": number 0-100,
        "performance": number 0-100,
        "accessibility": number 0-100,
        "bestPractices": number 0-100
    },
    "keywords": [
        {"word": "keyword", "count": number, "density": number}
    ],
    "issues": [
        {"severity": "critical" | "warning" | "info", "category": "string", "message": "string", "recommendation": "string"}
    ]
}`;

        // Call Google Generative AI API - use gemini-3.5-flash model
        const modelName = 'gemini-3.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        console.log(`Calling Gemini API with model: ${modelName}`);
        
        const response = await axios.post(
            url,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                timeout: 30000
            }
        );

        if (!response.data.candidates || !response.data.candidates[0]) {
            return { success: false, error: "No response from Gemini API" };
        }

        let responseText = response.data.candidates[0].content.parts[0].text;
        
        // Clean up markdown if present
        if (responseText.includes('```json')) {
            responseText = responseText.split('```json')[1].split('```')[0].trim();
        } else if (responseText.includes('```')) {
            responseText = responseText.split('```')[1].split('```')[0].trim();
        }

        const analysis = JSON.parse(responseText);
        console.log("✅ Gemini analysis successful - Score:", analysis.overallScore);

        return { success: true, data: analysis };

    } catch (error) {
        console.error('Gemini analyzing SEO data error:', error.message);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', JSON.stringify(error.response.data));
        }
        return { success: false, error: error.message || "Failed to analyze with Gemini" };
    }
}