import KeywordTracking from '../models/keywordTracking.js';
import { keywordTracking as runTrackingService } from '../services/keywordTrackingService.js';

export const addkeyword = async (req, res) => {
    try{
        const { keyword, url } = req.body;

        if(!keyword || !url) return res.status(400).json({ message: "Keyword and URL are required" });

        let domain;
        try{
            const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
            domain = urlObj.hostname;
        } catch (error) {
            return res.status(400).json({ message: "Invalid URL format" });
        }
        const existing  = await KeywordTracking.findOne({ userId: req.user._id, keyword: keyword.toLowerCase(), domain });
        if(existing) return res.status(400).json({ message: "You are already tracking this keyword for the specified domain" });

        const tracking = new KeywordTracking({
            userId: req.user._id,
            keyword: keyword.toLowerCase().trim(),
            URL: url.startsWith('http') ? url : `http://${url}`,
            domain,
            status: 'checking',
        });
        await tracking.save();
        res.status(201).json({ message: "Keyword tracking added successfully" });
        keywordTracking(tracking);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!tracking) {
            return res.status(444).json({
                success: false,
                message: "Keyword tracking not found"
            });
        }

        return res.status(200).json({
            success: true,
            tracking
        });
    } catch (error) {
        console.error("Get Keyword Target Resolution Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};

/**
 * @route   POST /api/rank/:id/refresh
 * @desc    Manually force immediate refresh checks targeting current keyword SERP metrics
 * @access  Private
 */
export const refreshKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword tracking not found"
            });
        }

        // Advance visual states down client views immediately via operational flag toggles
        tracking.status = 'checking';
        await tracking.save();

        res.status(200).json({
            success: true,
            message: "Rank check started"
        });

        // Trigger decoupled scrapper loops internally away from transactional blocks
        runTrackingService(tracking);

    } catch (error) {
        console.error("Refresh Keyword Processing Block Deviation:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};

/**
 * @route   DELETE /api/rank/:id
 * @desc    Delete a keyword from user dashboards and purge runtime collections entirely
 * @access  Private
 */
export const deleteKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword tracking not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Keyword tracking deleted"
        });
    } catch (error) {
        console.error("Delete Keyword Process Abort Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};

/**
 * @route   PUT /api/rank/:id/toggle
 * @desc    Toggle automated background recurring cron updates on/off for specific criteria
 * @access  Private
 */
export const toggleTracking = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword tracking not found"
            });
        }

        // Invert states perfectly to flag automation routines dynamically
        tracking.active = !tracking.active;
        await tracking.save();

        return res.status(200).json({
            success: true,
            tracking
        });
    } catch (error) {
        console.error("Toggle Tracking Automation Pipeline Interruption:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};