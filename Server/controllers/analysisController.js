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
            const analysis = await Analysis.create({userId, url: validUrl.href,status: "pending" });
            res.status(201).json({ success: true, data: analysis._id })
            
        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
}


//Get analysis by ID 
export const getAnalysis = async (req, res) => {
}

//get all analysis for user
export const getAnalysis = async (req, res) => {
}

// Delete analysis 
export const deleteAnalysis = async (req, res) => {
}

