const { exec } = require("child_process");

// Analyse sentiment of a URL (article or news source)
function analyseSentiment(req, res) {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.json({ sentiment: "N/A", confidence: 0, summary: "Invalid URL" });
  }

  exec(`python nlp/analyse.py "${url}"`, (error, stdout) => {
    if (error) {
      return res.json({ sentiment: "N/A", confidence: 0, summary: "Error analysing URL" });
    }
    
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (e) {
      res.json({ sentiment: "N/A", confidence: 0, summary: "Error parsing result" });
    }
  });
}

module.exports = {
  analyseSentiment
};
