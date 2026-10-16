// ==========================================
// ReverseEngineer AI - Gemini 4 Argon Backend Integration
// ==========================================

// 1. Google AI Studio Cloud Browser SDK Import
import { GoogleGenAI } from "https://esm.run";

// ⚠️ Google AI Studio-la irunthu edutha unga actual API Key-ai inge paste pannavum
const API_KEY = "YOUR_COPIED_GEMINI_API_KEY_HERE"; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Get HTML elements
const investigationForm = document.getElementById("investigationForm");
const setupImage = document.getElementById("setupImage");
const uploadArea = document.getElementById("uploadArea");
const browseButton = document.getElementById("browseButton");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreview = document.getElementById("imagePreview");
const imageFileName = document.getElementById("imageFileName");
const removeImageButton = document.getElementById("removeImage");

const resultsSection = document.getElementById("results");
const analyseButton = document.getElementById("analyseButton");
const newInvestigationButton = document.getElementById("newInvestigationButton");
const saveCaseButton = document.getElementById("saveCaseButton");
const historyContainer = document.getElementById("historyContainer");

let selectedImage = null;
let currentAnalysis = null;


// ==========================================
// 1. IMAGE UPLOAD
// ==========================================

browseButton.addEventListener("click", () => {
    setupImage.click();
});

uploadArea.addEventListener("click", (event) => {
    if (
        event.target === uploadArea ||
        event.target.closest("#uploadPlaceholder")
    ) {
        setupImage.click();
    }
});

setupImage.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
        displayImage(file);
    }
});

function displayImage(file) {
    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    // Limit upload size to 10 MB
    if (file.size > 10 * 1024 * 1024) {
        alert("Please choose an image smaller than 10 MB.");
        setupImage.value = "";
        return;
    }

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    imageFileName.textContent = file.name;

    uploadPlaceholder.hidden = true;
    imagePreviewContainer.hidden = false;
}

removeImageButton.addEventListener("click", () => {
    selectedImage = null;
    setupImage.value = "";

    imagePreview.removeAttribute("src");
    imageFileName.textContent = "";

    uploadPlaceholder.hidden = false;
    imagePreviewContainer.hidden = true;
});


// ==========================================
// 2. DRAG AND DROP IMAGE UPLOAD
// ==========================================

uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (file) {
        displayImage(file);
    }
});


// ==========================================
// 3. REAL-TIME INVESTIGATION FORM WITH GEMINI 4 ARGON
// ==========================================

investigationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectName = document.getElementById("projectName").value.trim();
    const targetOutcome = document.getElementById("targetOutcome").value.trim();
    const analysisMode = document.getElementById("analysisMode").value;

    if (!selectedImage) {
        alert("Please upload an image before starting your investigation.");
        return;
    }

    if (!targetOutcome) {
        alert("Please describe the target outcome.");
        return;
    }

    const modeNames = {
        education: "Lab Assistant / Education",
        engineering: "Hardware & Engineering",
        troubleshooting: "Troubleshooting & Maintenance"
    };

    // UI-la dynamic custom loading text setup updates
    analyseButton.disabled = true;
    analyseButton.textContent = "🔮 Argon Engine Analysing...";

    try {
        // Local uploaded image element processing base64 extraction parsing
        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(selectedImage);
        });

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: selectedImage.type
            }
        };

        const promptText = `
          The user is performing Reverse Engineering on a physical/digital setup.
          Target Outcome: "${targetOutcome}"
          Investigation Mode Layout context: "${modeNames[analysisMode]}"
          Project Reference: "${projectName || 'Untitled Case'}"
          
          Analyze this layout architecture structure and reply STRICTLY in valid JSON text matching this exact structure:
          {
            "process": ["step 1", "step 2", "step 3"],
            "evidence": ["point 1", "point 2"],
            "inferences": ["point 1", "point 2"],
            "unknowns": ["point 1", "point 2"],
            "feasibilityRating": "High/Medium/Low",
            "feasibilityExplanation": "brief explanation",
            "alternatives": ["point 1", "point 2"]
          }
          Provide exact analytical evaluation matching the fields. Output only raw JSON string payload context data, no markdown decorations.
        `;

        // Triggering the high-power Gemini 4 Argon AI system architecture model
        const response = await ai.models.generateContent({
            model: 'gemini-4-argon', 
            contents: [imagePart, promptText],
            config: {
                systemInstruction: "You are the primary core analytical parser backend engine for ReverseEngineer AI. Evaluate user setups objectively.",
                temperature: 0.2,
                responseMimeType: "application/json" // Forcing pure system data payload
            }
        });

        // Safe evaluation mapping structure translation
        const aiData = JSON.parse(response.text.trim());

        currentAnalysis = {
            id: createCaseId(),
            projectName: projectName || "Untitled Investigation",
            targetOutcome: targetOutcome,
            analysisMode: modeNames[analysisMode],
            imageName: selectedImage.name,
            createdAt: new Date().toLocaleString(),
            process: aiData.process || [],
            evidence: aiData.evidence || [],
            inferences: aiData.inferences || [],
            unknowns: aiData.unknowns || [],
            feasibility: {
                rating: aiData.feasibilityRating || "Not rated",
                explanation: aiData.feasibilityExplanation || "No explanation provided"
            },
            alternatives: aiData.alternatives || []
        };

        displayAnalysis(currentAnalysis);

    } catch (error) {
        console.error("Argon Framework dynamic execution runtime pipeline failure:", error);
        alert("AI Analysis Failed! Make sure your API key is correct and has access tier allocations setup.");
    } finally {
        analyseButton.disabled = false;
        analyseButton.textContent = "Analyse My Setup →";
    }
});


// ==========================================
// 4. DISPLAY ANALYSIS RESULTS
// ==========================================

function displayAnalysis(analysis) {
    document.getElementById("resultSummary").textContent =
        `${analysis.projectName} · ${analysis.analysisMode} · Live Gemini 4 Argon Case Log`;

    renderList("processResult", analysis.process);
    renderList("evidenceResult", analysis.evidence);
    renderList("inferenceResult", analysis.inferences);
    renderList("unknownResult", analysis.unknowns);

    document.getElementById("feasibilityResult").textContent =
        `${analysis.feasibility.rating}: ${analysis.feasibility.explanation}`;

    renderList("alternativesResult", analysis.alternatives);

    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// Create a list safely without inserting user content as HTML
function renderList(elementId, items) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    const list = document.createElement("ul");

    items.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        list.appendChild(listItem);
    });

    container.replaceChildren(list);
}


// ==========================================
// 5. GENERATE CASE ID
// ==========================================

function createCaseId() {
    return "CASE-" + Date.now().toString().slice(-8);
}


// ==========================================
// 6. SAVE INVESTIGATION HISTORY
// ==========================================

saveCaseButton.addEventListener("click", () => {
    if (!currentAnalysis) {
        alert("Please start an investigation first.");
        return;
    }

    try {
        const savedCases = JSON.parse(
            localStorage.getItem("reverseEngineerCases") || "[]"
        );

        const alreadySaved = savedCases.some(
            (item) => item.id === currentAnalysis.id
        );

        if (alreadySaved) {
            alert("This investigation is already saved.");
            return;
        }

        const caseToSave = { ...currentAnalysis };
        savedCases.push(caseToSave);
