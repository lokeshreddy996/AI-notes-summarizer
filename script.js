<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Notes Summarizer</title>
  <style>
    :root {
      --primary: #4361ee;
      --primary-dark: #3a56d4;
      --secondary: #3f37c9;
      --light: #f8f9fa;
      --dark: #212529;
      --gray: #6c757d;
      --error: #ef233c;
      --success: #4cc9f0;
      --border-radius: 12px;
      --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      --transition: all 0.3s ease;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--dark);
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 680px;
      margin: 0 auto;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
      padding: 1.5rem;
      text-align: center;
    }
    
    h1 {
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .content {
      padding: 2rem;
    }
    
    textarea {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e9ecef;
      border-radius: var(--border-radius);
      font-size: 1rem;
      resize: vertical;
      min-height: 200px;
      margin-bottom: 1rem;
    }
    
    textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
    }
    
    button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    button:hover {
      background: var(--primary-dark);
    }
    
    button:disabled {
      background: var(--gray);
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    #output {
      background: var(--light);
      padding: 1.5rem;
      border-radius: var(--border-radius);
      margin-top: 1.5rem;
      border-left: 4px solid var(--primary);
      min-height: 120px;
    }
    
    .loading {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 0.5rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error {
      color: var(--error);
      border-left-color: var(--error);
    }
    
    .word-count {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--gray);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        AI Notes Summarizer
      </h1>
    </header>
    
    <div class="content">
      <div class="word-count">
        <span id="charCount">0 characters</span>
        <span id="wordCount">0 words</span>
      </div>
      
      <textarea id="inputText" placeholder="Paste your notes here..."></textarea>
      
      <button id="summarizeBtn" onclick="summarizeText()">
        <span id="buttonText">Summarize</span>
      </button>
      
      <div id="output">Your summary will appear here...</div>
    </div>
  </div>

  <script>
    // DOM elements
    const inputText = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const buttonText = document.getElementById('buttonText');
    const outputDiv = document.getElementById('output');
    
    // Update character and word count
    inputText.addEventListener('input', updateCounts);
    
    function updateCounts() {
      const text = inputText.value;
      charCount.textContent = `${text.length} characters`;
      wordCount.textContent = `${text.trim() ? text.trim().split(/\s+/).length : 0} words`;
    }
    
    // Main summarization function
    async function summarizeText() {
      const text = inputText.value.trim();
      
      if (!text) {
        showError("Please enter some text to summarize");
        return;
      }
      
      if (text.length < 30) {
        showError("Please enter at least 30 characters for a meaningful summary");
        return;
      }
      
      try {
        // Disable button and show loading state
        summarizeBtn.disabled = true;
        buttonText.innerHTML = `<span class="loading"></span> Processing...`;
        outputDiv.textContent = "Analyzing content and generating summary...";
        outputDiv.classList.remove('error');
        
        // Call OpenAI API
        const summary = await getAISummary(text);
        
        // Display results
        outputDiv.innerHTML = `
          <strong>Summary:</strong><br><br>
          ${summary}
          <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--gray)">
            Summary length: ${summary.length} characters (${Math.round(100 - (summary.length / text.length * 100)}% reduction)
          </div>
        `;
      } catch (error) {
        console.error("Summarization error:", error);
        showError(error.message || "Failed to generate summary. Please try again.");
      } finally {
        // Re-enable button
        summarizeBtn.disabled = false;
        buttonText.textContent = "Summarize";
      }
    }
    
    // OpenAI API call
    async function getAISummary(text) {
      // In a production environment, you should call your backend API here
      // instead of exposing your API key in frontend code
      const apiKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual API key
      
      const prompt = `Please summarize the following text in a concise paragraph, maintaining all key points and concepts:\n\n${text}`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that summarizes text while preserving key information."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 300
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API request failed");
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || "No summary was generated.";
    }
    
    // Error display
    function showError(message) {
      outputDiv.textContent = message;
      outputDiv.classList.add('error');
    }
    
    // Initialize counts
    updateCounts();
  </script>
</body>
</html>
  
