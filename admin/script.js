const resultDiv = document.getElementById('result');
const historyList = document.getElementById('historyList');

function updateHistory(newKey) {
    const history = JSON.parse(localStorage.getItem('apikeyHistory') || '[]');
    history.push(newKey);
    localStorage.setItem('apikeyHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('apikeyHistory') || '[]');
    historyList.innerHTML = '';
    history.forEach((key) => {
        const li = document.createElement('li');
        li.textContent = key;
        historyList.appendChild(li);
    });
}

async function generateApiKey() {
    const name = document.getElementById('nameInput').value.trim();

    if (!name) {
        resultDiv.textContent = "Name cannot be empty!";
        resultDiv.className = "text-red-600 mt-4 text-center fade-in";
        resultDiv.classList.remove("hidden");
        return;
    }

    resultDiv.textContent = "Generating API Key...";
    resultDiv.className = "text-gray-600 mt-4 text-center fade-in";
    resultDiv.classList.remove("hidden");

    try {
        const res = await fetch(`https://zelapioffciall.vercel.app/generate/createapikey?name=${encodeURIComponent(name)}`);
        const data = await res.json();

        if (data.status && data["your apikey"]) {
            const apikey = data["your apikey"];
            resultDiv.innerHTML = `
                <p class="text-green-700 font-mono text-lg break-words">${apikey}</p>
            `;
            resultDiv.classList.remove("text-red-600");
            updateHistory(apikey);
        } else {
            resultDiv.innerHTML = `<span class="text-red-600">Failed to create API Key.</span>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<span class="text-red-600">Error: ${err.message}</span>`;
    }
}

// Load history on page load
renderHistory();
