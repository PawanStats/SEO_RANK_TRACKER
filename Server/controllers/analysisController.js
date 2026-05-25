import Analysis from "../models/Analysis";
// Anaylze a URL
export const analyzeUrl = async (req, res) => {
    try{
        const { url } = req.body;
            if (!url) return res.status(400).json({ success: false, message: "URL is required" });


            // Validate URL format
            let validUrl;
            try {
                validUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid URL format" });

            }

            // Send immediate response with analysis ID 
            const analysis = await Analysis.create({userId, url: validUrl.href,status: "pending" });

            // Run scraping and analysis in the background
            res.status(201).json({ success: true, data: analysis._id })

            // Run scraping and analysis in the background

            try{
                // step 1 : Scrape the URL with browsebase
                const scrapeResult = await scrapeUrl(validUrl.href)
                if(!scrapeResult.success){
                    analysis.status = "failed";
                    await analysis.save();
                    return;
                }
                // step 2 : Analyze with Gemini AI
                const aiResult = await analyzeSeoData(scrapeResult.data)
                if(!aiResult.success){
                    analysis.status = "failed";
                    await analysis.save();
                    return;
                }

                    // step 3 : Save results to database
                    analysis.overallScore = aiResult.data.overallScore || 0;
                    analysis.categories = aiResult.data.categories || {};
                    analysis.metaData = scrapeResult.data.metaData || {};
                    analysis.headings = scrapeResult.data.headings || {};
                    analysis.links = scrapeResult.data.links || [];
                    analysis.images = scrapeResult.data.images || [];
                    analysis.keywords = aiResult.data.keywords || [];
                    analysis.issues = aiResult.data.issues || [];
                    analysis.loadTime = scrapeResult.data.eordCount || 0;
                    analysis.status = "completed";
                    await analysis.save();

                
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
            res.status(500).json({ success: false, message: "Internal server error" });
        }
}


//Get analysis by ID 
export const getAnalysis = async (req, res) => {
    try{
        const analysis = await Analysis.findOne({_id: req.params.id, userId: req.user._id})

        if(!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });

        res.json({ success: true, analysis });

    } catch (error) {
        console.error("Get analysis error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//get all analyses for user
export const getAnalyses = async (req, res) => {
     try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const analyses = await Analysis.find({userId: req.user._Id}).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-issues -keywords");
        const total = await Analysis.countDocuments({userId: req.user._Id});

        res.json({ success: true, data: analyses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });


    } catch (error) {
        console.error("Get analysis error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Delete analysis 
export const deleteAnalysis = async (req, res) => {
     try{
         await Analysis.findByIdAndDelete({_id: req.params.id, userId: req.user._id});


         res.json({ success: true, message: "Analysis deleted" });

    } catch (error) {
        console.error("Delete analysis error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

