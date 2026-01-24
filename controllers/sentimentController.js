const { exec } = require("child_process");
const path = require("path");

// Store reference to models (will be injected from app.js)
let SentimentAnalysis = null;
let User = null;

// Initialize the database models
function initializeModels(models) {
  SentimentAnalysis = models.SentimentAnalysis;
  User = models.User;
}

// Analyse sentiment of a URL (article or news source)
function analyseSentiment(req, res) {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.json({ sentiment: "N/A", confidence: 0, summary: "Invalid URL" });
  }

  // Use the venv Python interpreter
  const pythonScript = path.join(__dirname, "../nlp/analyse.py");
  const venvPython = path.join(__dirname, "../venv/Scripts/python.exe");

  console.log("≡ƒöì Sentiment Analysis Request:");
  console.log("   URL:", url);
  console.log("   Python Path:", venvPython);
  console.log("   Script Path:", pythonScript);

  exec(`"${venvPython}" "${pythonScript}" "${url}"`, (error, stdout, stderr) => {
    console.log("≡ƒôñ Python Output:", stdout);
    if (stderr) console.error("ΓÜá∩╕Å Python Stderr:", stderr);
    if (error) console.error("Γ¥î Exec Error:", error);

    if (error) {
      return res.json({ sentiment: "N/A", confidence: 0, summary: "Error: " + stderr });    
    }

    try {
      const result = JSON.parse(stdout);
      console.log("Γ£à Sentiment Result:", result);
      res.json(result);
    } catch (e) {
      console.error('Parse Error:', e.message);
      res.json({ sentiment: "N/A", confidence: 0, summary: "Parse error: " + e.message });  
    }
  });
}

// Save analysis with notes
async function saveAnalysis(req, res) {
  const { url, sentiment, confidence, summary, notes, ticker, title } = req.body;

  if (!url || !sentiment) {
    return res.status(400).json({ error: "URL and sentiment are required" });
  }

  try {
    // Get the default dev_user
    const user = await User.findOne({ where: { name: 'dev_user' } });

    const analysis = await SentimentAnalysis.create({
      url,
      title: title || 'Untitled Article',
      ticker: ticker || '',
      sentiment,
      confidence,
      summary,
      notes: notes || "",
      isFavorite: false,
      UserId: user.id
    });

    console.log("≡ƒÆ╛ Analysis saved:", analysis.id);
    res.json({ success: true, id: analysis.id, message: "Analysis saved successfully" });   
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: "Error saving analysis: " + error.message });
  }
}

// Get all saved analyses
async function getAnalyses(req, res) {
  try {
    const user = await User.findOne({ where: { name: 'dev_user' } });
    const analyses = await user.getSentimentAnalyses();
    res.json({ analyses: analyses });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: "Error retrieving analyses" });
  }
}

// Get single analysis by ID
async function getAnalysis(req, res) {
  try {
    const { id } = req.params;
    const analysis = await SentimentAnalysis.findByPk(id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: "Error retrieving analysis" });
  }
}

// Update analysis notes or favorite status
async function updateAnalysis(req, res) {
  try {
    const { id } = req.params;
    const { notes, isFavorite } = req.body;

    const analysis = await SentimentAnalysis.findByPk(id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (notes !== undefined) analysis.notes = notes;
    if (isFavorite !== undefined) analysis.isFavorite = isFavorite;

    await analysis.save();

    console.log("Γ£Å∩╕Å Analysis updated:", id);
    res.json({ success: true, message: "Analysis updated successfully", analysis });        
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: "Error updating analysis" });
  }
}

// Delete analysis
async function deleteAnalysis(req, res) {
  try {
    const { id } = req.params;
    const analysis = await SentimentAnalysis.findByPk(id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    await analysis.destroy();
    console.log("≡ƒùæ∩╕Å Analysis deleted:", id);
    res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: "Error deleting analysis" });
  }
}

module.exports = {
  initializeModels,
  analyseSentiment,
  saveAnalysis,
  getAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis
};
