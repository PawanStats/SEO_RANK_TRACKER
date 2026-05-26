import Analysis from "../models/Analysis.js";
import { analyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/cheerioScraperService.js";
// Anaylze a URL
export const analyzeUrl = async (req, res) => {
    try{
        const { url } = req.body;
        console.log("📊 Analyze request - Body:", JSON.stringify(req.body));
        console.log("📊 Analyze request for URL:", url, "User ID:", req.user._id);
            if (!url) {
                console.log("❌ URL missing in request");
                return res.status(400).json({ success: false, message: "URL is required" });
            }


            // Validate URL format
            let validUrl;
            try {
                validUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid URL format" });

            }

            // Send immediate response with analysis ID 
            const analysis = await Analysis.create({userId: req.user._id, url: validUrl.href,status: "pending" });
            console.log("✅ Analysis created with ID:", analysis._id.toString());

            // Run scraping and analysis in the background
            res.status(201).json({ success: true, analysisId: analysis._id.toString() });

            // Run scraping and analysis in the background

            try{
                // step 1 : Scrape the URL
                console.log("🔍 Starting scrape for:", validUrl.href);
                const scrapeResult = await scrapeUrl(validUrl.href)
                if(!scrapeResult.success){
                    console.log("❌ Scraping failed");
                    analysis.status = "failed";
                    await analysis.save();
                    return;
                }
                console.log("✅ Scraping successful");
                // step 2 : Analyze with Gemini AI
                const aiResult = await analyzeSeoData(scrapeResult.data)
                if(!aiResult.success){
                    console.log("❌ Gemini analysis failed");
                    analysis.status = "failed";
                    await analysis.save();
                    return;
                }
                console.log("✅ Gemini analysis successful");

                    // step 3 : Save results to database
                    analysis.overallScore = aiResult.data.overallScore || 0;
                    analysis.categories = aiResult.data.categories || {};
                    analysis.metaData = scrapeResult.data.metaData || {};
                    analysis.headings = scrapeResult.data.headings || {};
                    analysis.links = scrapeResult.data.links || {};
                    analysis.images = scrapeResult.data.images || {};
                    analysis.keywords = aiResult.data.keywords || [];
                    analysis.issues = aiResult.data.issues || [];
                    analysis.loadTime = scrapeResult.data.loadTime || 0;
                    analysis.pageSize = scrapeResult.data.pageSize || 0;
                    analysis.wordCount = scrapeResult.data.wordCount || 0;
                    analysis.status = "completed";
                    await analysis.save();
                    console.log("✅ Analysis saved successfully - ID:", analysis._id.toString(), "Status:", analysis.status);

                
            } catch (bgError) {
                console.error("Background analysis error:", bgError.message);
                try{
                    analysis.status = "failed";
                    await analysis.save();
                } catch (saveError) {
                    console.error("Failed to save failed analysis:", saveError.message);
                }
            }


        } catch (error) {
            console.error(" analysis url error:", error.message);
                if(!res.headersSent) {
                    res.status(500).json({ success: false, message: "server error" });
                }
        }
}


//Get analysis by ID 
export const getAnalysis = async (req, res) => {
    try{
        console.log("🔎 Fetching analysis - ID:", req.params.id, "User ID:", req.user._id);
        const analysis = await Analysis.findOne({_id: req.params.id, userId: req.user._id})

        if(!analysis) {
            console.log("❌ Analysis not found for ID:", req.params.id);
            return res.status(404).json({ success: false, message: "Analysis not found" });
        }

        console.log("✅ Analysis found - Status:", analysis.status);
        res.json({ success: true, analysis });

    } catch (error) {
        console.error("Get analysis error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Delete analysis by ID
export const deleteAnalysis = async (req, res) => {
    try{
        console.log("🗑️  Deleting analysis - ID:", req.params.id, "User ID:", req.user._id);
        const analysis = await Analysis.findOneAndDelete({_id: req.params.id, userId: req.user._id})

        if(!analysis) {
            console.log("❌ Analysis not found for deletion - ID:", req.params.id);
            return res.status(404).json({ success: false, message: "Analysis not found" });
        }

        console.log("✅ Analysis deleted successfully - ID:", req.params.id);
        res.json({ success: true, message: "Analysis deleted successfully" });

    } catch (error) {
        console.error("Delete analysis error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//get all analyses for user
export const getAnalyses = async (req, res) => {
     try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const analyses = await Analysis.find({userId: req.user._id}).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-issues -keywords");
        const total = await Analysis.countDocuments({userId: req.user._id});

        res.json({ success: true, data: analyses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });


    } catch (error) {
        console.error("Get analysis error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

