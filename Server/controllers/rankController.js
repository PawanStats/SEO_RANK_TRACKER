

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
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getkeywords = async (req, res) => {
}

export const getkeyword = async (req, res) => {
}


export const refreshkeyword = async (req, res) => {
}

export const deletekeyword = async (req, res) => {
}

export const toggleTracking = async (req, res) => {
}