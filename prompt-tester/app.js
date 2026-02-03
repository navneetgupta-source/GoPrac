// OpenAI API Configuration
// IMPORTANT: Enter your API key when prompted - never commit it to git
let OPENAI_API_KEY = localStorage.getItem('openai_api_key') || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Function to set API key (call this from browser console or add a UI input)
function setApiKey(key) {
    OPENAI_API_KEY = key;
    localStorage.setItem('openai_api_key', key);
    console.log('API key saved to localStorage');
}

// Pre-configured Prompts for Resume Analysis
const PROMPTS = [
    {
        id: 'extract-basic',
        name: 'Extract Basic Data',
        description: 'Extract candidate name, age, location, domain, and contact details',
        systemPrompt: `You are an expert resume parser. Your task is to extract basic information from a resume with high accuracy.

IMPORTANT INSTRUCTIONS:
- Read the ENTIRE resume carefully before extracting information
- Look for LinkedIn URLs (linkedin.com/in/...), GitHub profiles (github.com/...), portfolio websites, or personal websites
- For location: Extract the candidate's PERSONAL/HOME address or city, NOT their workplace or internship location
- Look for location in the header, contact section, or address section of the resume
- For domain: Identify the PRIMARY professional field based on their skills, experience, and job titles

Extract the following information and return it in a structured JSON format:

1. **candidate_name**: Full name of the candidate (usually at the top of the resume)
2. **age**: Age of the candidate (if mentioned or can be calculated from date of birth)
3. **location**: Candidate's HOME city, state, country (NOT internship/job locations)
4. **domain**: Primary professional domain/field (e.g., Software Engineering, Data Science, Marketing, etc.)
5. **contact_details**: Object containing:
   - email: Email address (look for @ symbol)
   - phone: Phone number(s) with country code if available
   - linkedin: LinkedIn profile URL (look for "linkedin.com/in/" or "LinkedIn:" labels)
   - github: GitHub profile URL (look for "github.com/" or "GitHub:" labels)
   - portfolio: Portfolio/personal website URL (any other URLs that aren't LinkedIn/GitHub)

SEARCH THOROUGHLY for all links - they may be:
- In the header/contact section
- Hyperlinked text
- Listed under "Links", "Profiles", "Connect", or similar sections
- At the bottom of the resume

If a field is genuinely not present in the resume after thorough search, set it to null.

Return ONLY valid JSON in this exact format:
{
    "candidate_name": "...",
    "age": "...",
    "location": "...",
    "domain": "...",
    "contact_details": {
        "email": "...",
        "phone": "...",
        "linkedin": "...",
        "github": "...",
        "portfolio": "..."
    }
}`,
        userPromptPrefix: 'Please extract the basic information from the following resume. Pay special attention to finding ALL social/professional links (LinkedIn, GitHub, portfolio) and ensure the location is the candidate\'s home address, not their workplace:\n\n'
    },
    {
        id: 'extract-education',
        name: 'Extract Education & Background',
        description: 'Extract education degrees, experience, certifications, and coursework',
        systemPrompt: `You are an expert resume parser. Your task is to extract education and professional background details from a resume.

Extract the following information and return it in a structured JSON format:

1. **education**: Array of education entries, each containing:
   - degree: Degree name (e.g., "Bachelor of Science in Computer Science")
   - institution: University/College name
   - graduation_year: Year of graduation
   - gpa: GPA if mentioned

2. **experience_by_domain**: Object mapping each skill/domain to experience duration:
   - Format: "skill_name": { "years": X, "months": Y }
   - Include both technical skills and soft skills

3. **certifications**: Array of certifications, each containing:
   - name: Certification name
   - issuer: Issuing organization
   - year: Year obtained (if mentioned)
   - validity: Expiry or "No Expiry"

4. **coursework**: Array of relevant courses or training programs completed

If any field is not found in the resume, set it to an empty array or null.

Return ONLY valid JSON in this exact format:
{
    "education": [...],
    "experience_by_domain": {...},
    "certifications": [...],
    "coursework": [...]
}`,
        userPromptPrefix: 'Please extract the education and background details from the following resume:\n\n'
    },
    {
        id: 'generate-questions',
        name: 'Generate Interview Questions',
        description: 'Generate 10 personalized interview questions in which 2 are situational questions',
        systemPrompt: `You are an expert technical interviewer. Based on the candidate's profile information provided, generate 10 personalized interview questions AND 5 situational questions based on their resume.

For each INTERVIEW QUESTION, provide the following metadata:

1. **question**: The interview question text
2. **category**: Category of question (Technical, Behavioral, Situational, Domain-Specific, Problem-Solving)
3. **difficulty**: Easy, Medium, or Hard
4. **target_skill**: The specific skill or competency being assessed
5. **expected_answer_points**: Key points expected in a good answer (array of 3-5 points)
6. **follow_up_questions**: Array of 2 potential follow-up questions
7. **time_allocation_minutes**: Recommended time for this question (1-5 minutes)

For each SITUATIONAL QUESTION, create scenarios based on:
- Projects mentioned in their resume (e.g., "During your [Project X], what would you do if...")
- Technologies they've worked with (e.g., "Imagine your [Tech] system goes down...")
- Their past roles and responsibilities
- Challenges they might have faced in their domain

Situational question format:
1. **scenario**: Detailed situation description based on their resume context
2. **question**: The question asking how they would handle it
3. **based_on**: Which part of their resume inspired this scenario (project name, role, or skill)
4. **skills_tested**: Array of skills being evaluated
5. **ideal_approach**: Key steps in an ideal response

Make sure the questions are:
- Tailored to the candidate's specific experience and domain
- Progressive in difficulty (start easier, get harder)
- A mix of different categories
- Relevant to the roles they would be applying for

Return ONLY valid JSON in this format:
{
    "interview_questions": [
        {
            "question": "...",
            "category": "...",
            "difficulty": "...",
            "target_skill": "...",
            "expected_answer_points": [...],
            "follow_up_questions": [...],
            "time_allocation_minutes": X
        }
    ],
    "situational_questions": [
        {
            "scenario": "...",
            "question": "...",
            "based_on": "...",
            "skills_tested": [...],
            "ideal_approach": [...]
        }
    ],
    "total_interview_time_minutes": X,
    "interview_summary": "Brief description of what this interview will assess"
}`,
        userPromptPrefix: 'Based on the following candidate profile, generate 10 personalized interview questions in which 2 are situational questions based on their resume:\n\n'
    }
];

// State
let history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
let currentPrompt = null;
let workflowData = {};

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    setupTabs();
    setupSettings();
    setupPlayground();
    setupWorkflow();
    setupHistory();
    renderHistory();
});

// Tab navigation
function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

// Settings dropdown
function setupSettings() {
    const btn = document.getElementById('settingsBtn');
    const dropdown = document.getElementById('settingsDropdown');
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', () => dropdown.classList.remove('show'));
    dropdown.addEventListener('click', e => e.stopPropagation());
    
    document.getElementById('temperature').addEventListener('input', e => {
        document.getElementById('tempVal').textContent = e.target.value;
    });
    
    document.getElementById('topP').addEventListener('input', e => {
        document.getElementById('topPVal').textContent = e.target.value;
    });
}

// Playground setup
function setupPlayground() {
    const promptSelect = document.getElementById('promptSelect');
    const systemPrompt = document.getElementById('systemPrompt');
    const userInput = document.getElementById('userInput');
    const outputBox = document.getElementById('outputBox');
    
    // Prompt selector
    promptSelect.addEventListener('change', () => {
        const p = PROMPTS.find(x => x.id === promptSelect.value);
        if (p) {
            currentPrompt = p;
            systemPrompt.value = p.systemPrompt;
            toast('Loaded: ' + p.name);
        }
    });
    
    // PDF upload
    document.getElementById('pdfUpload').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById('fileName').textContent = file.name;
        
        if (file.type === 'application/pdf') {
            showLoader(true);
            try {
                const text = await extractPDF(file);
                userInput.value = text;
                autoAdjustTokens(text);
                toast('PDF loaded');
            } catch (err) {
                toast('PDF error: ' + err.message, true);
            }
            showLoader(false);
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => {
                userInput.value = ev.target.result;
                autoAdjustTokens(ev.target.result);
            };
            reader.readAsText(file);
        }
    });
    
    // Run button
    document.getElementById('runBtn').addEventListener('click', async () => {
        const sys = systemPrompt.value.trim();
        const usr = userInput.value.trim();
        if (!sys && !usr) { toast('Enter a prompt', true); return; }
        
        showLoader(true);
        const start = Date.now();
        try {
            const res = await callAPI(sys, currentPrompt ? currentPrompt.userPromptPrefix + usr : usr);
            outputBox.innerHTML = formatJSON(res.content);
            document.getElementById('outputStats').textContent = 
                `${res.usage?.total_tokens || '?'} tokens · ${((Date.now() - start) / 1000).toFixed(1)}s`;
            toast('Done');
        } catch (err) {
            outputBox.textContent = 'Error: ' + err.message;
            toast('Failed', true);
        }
        showLoader(false);
    });
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
        systemPrompt.value = '';
        userInput.value = '';
        outputBox.textContent = 'Run a prompt to see results';
        document.getElementById('outputStats').textContent = '';
        document.getElementById('promptSelect').value = '';
        document.getElementById('fileName').textContent = '';
        currentPrompt = null;
        toast('Cleared');
    });
    
    // Copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(outputBox.textContent);
        toast('Copied');
    });
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => {
        const out = outputBox.textContent;
        if (!out || out === 'Run a prompt to see results') { toast('Nothing to save', true); return; }
        
        history.unshift({
            id: Date.now(),
            time: new Date().toISOString(),
            name: currentPrompt?.name || 'Custom',
            system: systemPrompt.value,
            user: userInput.value.substring(0, 300),
            output: out
        });
        localStorage.setItem('promptHistory', JSON.stringify(history));
        renderHistory();
        toast('Saved');
    });
}

// Workflow setup
function setupWorkflow() {
    const resumeInput = document.getElementById('workflowResume');
    
    // File upload for workflow
    document.getElementById('workflowFile').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type === 'application/pdf') {
            showLoader(true);
            try {
                const text = await extractPDF(file);
                resumeInput.value = text;
                autoAdjustTokens(text);
                toast('PDF loaded');
            } catch (err) {
                toast('PDF error', true);
            }
            showLoader(false);
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => {
                resumeInput.value = ev.target.result;
                autoAdjustTokens(ev.target.result);
            };
            reader.readAsText(file);
        }
    });
    
    // Run workflow button
    document.getElementById('runWorkflowBtn').addEventListener('click', async () => {
        const resume = resumeInput.value.trim();
        if (!resume) { toast('Paste a resume first', true); return; }
        
        workflowData = {};
        resetSteps();
        
        try {
            // Step 1: Extract Basic Data
            await runStep(1, PROMPTS[0], resume);
            
            // Step 2: Extract Education & Background
            await runStep(2, PROMPTS[1], resume);
            
            // Step 3: Generate Interview Questions
            const context = `CANDIDATE BASIC INFO:\n${workflowData.s1}\n\nEDUCATION & BACKGROUND:\n${workflowData.s2}`;
            await runStep(3, PROMPTS[2], context);
            
            toast('Workflow done');
            
            // Save to history
            history.unshift({
                id: Date.now(),
                time: new Date().toISOString(),
                name: 'Full Workflow',
                system: 'Multi-step workflow',
                user: resume.substring(0, 200),
                output: JSON.stringify({ basic: workflowData.s1, education: workflowData.s2, questions: workflowData.s3 })
            });
            localStorage.setItem('promptHistory', JSON.stringify(history));
            renderHistory();
            
        } catch (err) {
            toast('Workflow failed: ' + err.message, true);
        }
    });
}

// Run a single workflow step
async function runStep(n, prompt, input) {
    const step = document.querySelector(`.step[data-step="${n}"]`);
    const status = document.getElementById(`s${n}status`);
    const result = document.getElementById(`s${n}result`);
    
    step.classList.add('running');
    step.classList.remove('done', 'error');
    status.textContent = 'running...';
    
    try {
        const res = await callAPI(prompt.systemPrompt, prompt.userPromptPrefix + input);
        workflowData[`s${n}`] = res.content;
        step.classList.remove('running');
        step.classList.add('done');
        status.textContent = 'done';
        result.innerHTML = formatJSON(res.content);
    } catch (err) {
        step.classList.remove('running');
        step.classList.add('error');
        status.textContent = 'failed';
        result.textContent = err.message;
        throw err;
    }
}

// Reset workflow steps UI
function resetSteps() {
    for (let i = 1; i <= 3; i++) {
        const step = document.querySelector(`.step[data-step="${i}"]`);
        step.classList.remove('running', 'done', 'error');
        document.getElementById(`s${i}status`).textContent = 'waiting';
        document.getElementById(`s${i}result`).textContent = '...';
    }
}

// History setup
function setupHistory() {
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Clear all history?')) {
            history = [];
            localStorage.removeItem('promptHistory');
            renderHistory();
            toast('History cleared');
        }
    });
}

// Render history list
function renderHistory() {
    const list = document.getElementById('historyList');
    if (history.length === 0) {
        list.innerHTML = '<p class="empty">No history yet</p>';
        return;
    }
    
    list.innerHTML = history.slice(0, 20).map(h => `
        <div class="history-item" data-id="${h.id}">
            <h4>${h.name}</h4>
            <div class="time">${new Date(h.time).toLocaleString()}</div>
            <div class="preview">${(h.output || '').substring(0, 100)}...</div>
        </div>
    `).join('');
    
    list.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const h = history.find(x => x.id === parseInt(item.dataset.id));
            if (!h) return;
            
            document.querySelector('.tab[data-tab="playground"]').click();
            document.getElementById('systemPrompt').value = h.system || '';
            document.getElementById('userInput').value = h.user || '';
            document.getElementById('outputBox').innerHTML = formatJSON(h.output || '');
            toast('Loaded from history');
        });
    });
}

// Auto-adjust max tokens based on input size
function autoAdjustTokens(text) {
    const maxTokensInput = document.getElementById('maxTokens');
    
    // Estimate input tokens (~4 chars per token for English)
    const estimatedInputTokens = Math.ceil(text.length / 4);
    
    // Calculate recommended output tokens based on input size
    // For resume analysis: output is usually structured JSON which can be lengthy
    let recommendedTokens;
    
    if (estimatedInputTokens < 500) {
        // Short resume (1 page, minimal content)
        recommendedTokens = 1500;
    } else if (estimatedInputTokens < 1000) {
        // Standard 1-page resume
        recommendedTokens = 2000;
    } else if (estimatedInputTokens < 2000) {
        // Detailed 1-2 page resume
        recommendedTokens = 3000;
    } else {
        // Long 2+ page resume with lots of details
        recommendedTokens = 4000;
    }
    
    maxTokensInput.value = recommendedTokens;
    console.log(`Auto-adjusted tokens: Input ~${estimatedInputTokens} tokens → Output limit set to ${recommendedTokens}`);
}

// API Call
async function callAPI(system, user) {
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    if (user) messages.push({ role: 'user', content: user });
    
    const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: document.getElementById('modelSelect').value,
            messages,
            temperature: parseFloat(document.getElementById('temperature').value),
            max_completion_tokens: parseInt(document.getElementById('maxTokens').value),
            top_p: parseFloat(document.getElementById('topP').value)
        })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'API error');
    }
    
    const data = await res.json();
    return { content: data.choices[0].message.content, usage: data.usage };
}

// PDF extraction with hyperlinks and better text handling
async function extractPDF(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let fullText = '';
    let links = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Smarter text extraction - handle character spacing issues
        let lineText = '';
        let lastX = 0;
        let lastY = null;
        
        content.items.forEach(item => {
            const x = item.transform[4];
            const y = item.transform[5];
            const text = item.str;
            
            // New line detection (Y position changed significantly)
            if (lastY !== null && Math.abs(y - lastY) > 5) {
                // Clean up excessive spaces and add to full text
                fullText += cleanText(lineText) + '\n';
                lineText = '';
                lastX = 0;
            }
            
            // Check if we need a space (gap between items)
            if (lastX > 0 && x > lastX + 10) {
                lineText += ' ';
            }
            
            lineText += text;
            lastX = x + (item.width || text.length * 5);
            lastY = y;
        });
        
        // Add remaining text from last line
        if (lineText.trim()) {
            fullText += cleanText(lineText) + '\n';
        }
        
        // Extract hyperlinks
        try {
            const annots = await page.getAnnotations();
            annots.forEach(a => {
                if (a.subtype === 'Link' && a.url) links.push(a.url);
            });
        } catch (e) {}
    }
    
    if (links.length > 0) {
        fullText += '\n\n--- EXTRACTED HYPERLINKS FROM RESUME ---\n';
        links.forEach(l => {
            if (l.includes('linkedin.com')) fullText += `LinkedIn URL: ${l}\n`;
            else if (l.includes('github.com')) fullText += `GitHub URL: ${l}\n`;
            else if (l.includes('leetcode.com')) fullText += `LeetCode URL: ${l}\n`;
            else if (l.includes('oracle.com') || l.includes('credly.com')) fullText += `Certification URL: ${l}\n`;
            else fullText += `Portfolio/Other URL: ${l}\n`;
        });
    }
    
    return fullText;
}

// Clean text - fix character spacing issues
function cleanText(text) {
    return text
        // Fix single-spaced capital letters (R U C H A -> RUCHA)
        .replace(/\b([A-Z])\s+(?=[A-Z]\s+[A-Z]|[A-Z]\b)/g, '$1')
        // Fix remaining single letter spacing patterns
        .replace(/([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3$4$5')
        .replace(/([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3$4')
        .replace(/([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3')
        // Collapse multiple spaces into one
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// Format JSON output with syntax highlighting
function formatJSON(str) {
    try {
        const obj = JSON.parse(str);
        const pretty = JSON.stringify(obj, null, 2);
        return '<pre>' + pretty
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false|null)/g, ': <span class="json-boolean">$1</span>')
            + '</pre>';
    } catch {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }
}

// Show/hide loader
function showLoader(show) {
    document.getElementById('loader').classList.toggle('show', show);
}

// Toast notification
function toast(msg, isError) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => t.classList.remove('show'), 2500);
}
