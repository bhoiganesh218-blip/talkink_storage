// =========================================================================
// 🔥 FIREBASE CORE INFRASTRUCTURE INITIALIZATION
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Aapki Verified Firebase Configuration Matrix
const firebaseConfig = {
  apiKey: "AIzaSyCeDTHuvrldGjitqC8ZSl1fYWMhI2KP7lQ",
  authDomain: "talk-storage.firebaseapp.com",
  projectId: "talk-storage",
  storageBucket: "talk-storage.firebasestorage.app",
  messagingSenderId: "264599405442",
  appId: "1:264599405442:web:281c7859568f50aeb1059b",
  measurementId: "G-SYG9X2S5JZ"
};

// Initialize Instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================================================================
// 📱 PWA CORE SERVICE WORKER REGISTRATION
// =========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('🚀 Talkink PWA Service Worker Registered! Scope:', reg.scope))
            .catch(err => console.error('❌ Service Worker Registration Failed:', err));
    });
}

// =========================================================================
// 🌐 DATA MATRIX PIPELINE FOR CLOUDINARY TO FIRESTORE
// =========================================================================
async function saveUploadMetadataToFirestore(fileName, fileUrl, activeBoxId) {
    try {
        // Universal UTC Timestamp ISO standard format
        const currentTimestamp = new Date().toISOString(); 

        // 'uploads' collection ke andar ek unique random auto-generated document create hoga
        const uploadCollectionRef = collection(db, "uploads");
        const newDocRef = doc(uploadCollectionRef); 
        
        // Payload Matrix Data Structure
        await setDoc(newDocRef, {
            name: fileName,
            url: fileUrl,
            timestamp: currentTimestamp,
            boxId: Number(activeBoxId), // Dynamic box ID tracing (1 se 7)
            status: "secured_in_vault"
        });

        console.log(`🚀 [Vault Sync]: Metadata for "${fileName}" successfully pushed to Box ${activeBoxId}!`);
    } catch (error) {
        console.error("❌ [Vault Sync Error]: Firebase payload delivery interrupted:", error);
    }
}

/**
 * 🎛️ TALKINK STORAGE - CORE INTERACTION & LIVE STREAM ENGINE
 * Handles multi-account configurations, modal transitions, and real-time chunked uploads.
 */

// 🌐 1. CLOUDINARY MULTI-ACCOUNT VAULT CONFIGURATION
const cloudinaryVaultConfig = {
    1: { cloudName: "dtaqjqxoh", uploadPreset: "talkink_img_vault_01" },
    2: { cloudName: "dnyccosh5", uploadPreset: "talkink_img_vault_02" },
    3: { cloudName: "db90ccwcm", uploadPreset: "talkink_pdf_vault_01" },
    4: { cloudName: "dxfe8jesf", uploadPreset: "talkink_pdf_vault_02" },
    5: { cloudName: "dz87cseqh", uploadPreset: "talkink_pdf_vault_03" },
    6: { cloudName: "dax3zjkaf", uploadPreset: "talkink_pdf_vault_04" }
};

// Global Tracking State Engine
let activeNodeState = {
    id: null,
    name: null
};

/**
 * 🚀 2. OPENS THE INTERACTION PORTAL (FIRST MODAL)
 */
window.openAccountPortal = function(nodeId, nodeName) {
    activeNodeState.id = nodeId;
    activeNodeState.name = nodeName;

    let modal = document.getElementById('accountPortalModal');
    
    if (modal) {
        modal.innerHTML = `
            <div class="portal-modal-card">
                <div class="modal-header">
                    <div class="modal-title-group">
                        <span class="pulse-indicator"></span>
                        <h3>Accessing: ${nodeName}</h3>
                    </div>
                    <button class="modal-close-btn" onclick="closeAccountPortal()">&times;</button>
                </div>
                
                <p class="modal-subtitle">Select an operation protocol for Cloudinary Storage Node 0${nodeId}</p>
                
                <div class="modal-options-grid">
                    <div class="action-card upload-trigger" onclick="triggerUploadSystem()">
                        <div class="action-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                        <div class="action-meta">
                            <h4>Upload File</h4>
                            <p>Stream assets directly to this node's bucket</p>
                        </div>
                    </div>
                    
                    <div class="action-card details-trigger" onclick="handleProtocolSelection('details')">
                        <div class="fa-solid fa-chart-pie action-icon"></div>
                        <div class="action-meta">
                            <h4>All Files Details</h4>
                            <p>Inspect indexing, size configurations & registry</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('portal-modal-active'); }, 10);
    }
}

/**
 * 🔒 3. CLOSES THE INTERACTION PORTAL
 */
window.closeAccountPortal = function() {
    let modal = document.getElementById('accountPortalModal');
    if (modal) {
        modal.classList.remove('portal-modal-active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

/**
 * 📊 4. PROTOCOL SELECTION ROUTER
 */
window.handleProtocolSelection = function(mode) {
    if (mode === 'details') {
      
        alert(`📊 Telemetry File Details for ${activeNodeState.name} will trigger here!`);
    }
}

/**
 * 🚀 5. FULLSCREEN UPLOAD PANEL LOGIC
 */
window.triggerUploadSystem = function() {
    closeAccountPortal();
    const currentNodeConfig = cloudinaryVaultConfig[activeNodeState.id];
    
    let uploadOverlay = document.createElement('div');
    uploadOverlay.id = 'fullscreenUploadPanel';
    uploadOverlay.className = 'upload-fullscreen-overlay';
    
    uploadOverlay.innerHTML = `
        <div class="upload-panel-card">
            <div class="panel-header">
                <div class="node-badge-info">
                    <i class="fa-solid fa-network-wired"></i> NODE_0${activeNodeState.id}_ACTIVE
                </div>
                <button class="panel-close-btn" onclick="destroyUploadPanel()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="panel-meta-info">
                <h3>System Upload Gateway</h3>
                <p>Target Node: <span class="highlight-text">${activeNodeState.name}</span></p>
                <p class="preset-debug">Preset Registered: <span>${currentNodeConfig ? currentNodeConfig.uploadPreset : 'NOT_FOUND'}</span></p>
            </div>

            <div class="dropzone-area" id="dropzoneContainer" onclick="document.getElementById('fileSourceInput').click()">
                <input type="file" id="fileSourceInput" style="display:none;" onchange="processFilePreview(this)">
                <div class="dropzone-default-view" id="dropzoneDefaultView">
                    <div class="cloud-bounce-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="main-drop-text">Click or Drag file here to stage</p>
                    <p class="sub-drop-text">Supports Images, Documents, and PDFs</p>
                </div>
                
                <div class="dropzone-preview-view" id="dropzonePreviewView" style="display:none;">
                    <div id="visualPreviewContainer" class="preview-media-holder"></div>
                    <div class="file-meta-tag" id="fileMetaTag">file_name.jpg</div>
                </div>
            </div>

            <div class="progress-telemetry-box" id="progressTelemetryBox" style="display:none;">
                <div class="progress-status-row">
                    <span id="uploadStatusLabel">Uploading Packet...</span>
                    <span id="progressPercentageLabel">0%</span>
                </div>
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" id="progressBarFill" style="width: 0%;"></div>
                </div>
            </div>

            <button class="fire-upload-btn" id="fireUploadBtn" disabled onclick="executeCloudinaryTransfer()">
                <i class="fa-solid fa-bolt"></i> Initialize Secure Upload
            </button>
        </div>
    `;

    document.body.appendChild(uploadOverlay);
    setTimeout(() => { uploadOverlay.classList.add('panel-overlay-active'); }, 10);
}

/**
 * 📸 6. LIVE FILE VISUAL PREVIEW GENERATOR
 */
window.processFilePreview = function(input) {
    const file = input.files[0];
    if (!file) return;

    const defaultView = document.getElementById('dropzoneDefaultView');
    const previewView = document.getElementById('dropzonePreviewView');
    const visualContainer = document.getElementById('visualPreviewContainer');
    const metaTag = document.getElementById('fileMetaTag');
    const fireBtn = document.getElementById('fireUploadBtn');

    metaTag.innerText = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    defaultView.style.display = 'none';
    previewView.style.display = 'flex';
    visualContainer.innerHTML = '';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            visualContainer.innerHTML = `<img src="${e.target.result}" alt="Preview Staged Asset">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        visualContainer.innerHTML = `<div class="doc-preview-icon"><i class="fa-solid fa-file-pdf"></i><p>PDF Document</p></div>`;
    } else {
        visualContainer.innerHTML = `<div class="doc-preview-icon"><i class="fa-solid fa-file-code"></i><p>Binary Asset File</p></div>`;
    }

    fireBtn.removeAttribute('disabled');
    fireBtn.classList.add('btn-ready');
}

// Global reference export forwarder pipeline (Kyunki module script local scopes ko block karti hai HTML elements se execute hone ke liye)
window.destroyUploadPanel = function() {
    const panel = document.getElementById('fullscreenUploadPanel');
    if (panel) {
        panel.classList.remove('panel-overlay-active');
        setTimeout(() => panel.remove(), 300);
    }
};






/**
 * ⚡ 7. REAL LIVE CLOUDINARY CHUNKED STREAM TRANSFER ENGINE (FIXED FOR 10MB+)
 * Badi files ko automatic 5MB ke chunks me tod kar loop me upload karega + Smooth Fake Progress Integration.
 */

window.executeCloudinaryTransfer = function() {
    const fileInput = document.getElementById('fileSourceInput');
    const file = fileInput.files[0];
    if (!file) return;

    const currentNodeConfig = cloudinaryVaultConfig[activeNodeState.id];
    if (!currentNodeConfig || currentNodeConfig.cloudName.startsWith("your_cloud_name")) {
        alert("❌ Configuration Missing: Please update cloudName inside script.js!");
        return;
    }

    const fireBtn = document.getElementById('fireUploadBtn');
    const telemetryBox = document.getElementById('progressTelemetryBox');
    const barFill = document.getElementById('progressBarFill');
    const percentLabel = document.getElementById('progressPercentageLabel');
    const statusLabel = document.getElementById('uploadStatusLabel');

    // UI Controls Lock
    fireBtn.setAttribute('disabled', 'true');
    fireBtn.classList.remove('btn-ready');
    telemetryBox.style.display = 'block';

    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
    
    // 📦 CHUNKED UPLOAD CONFIGURATION VARIABLES
    const chunkSize = 5 * 1024 * 1024; // 5MB ka ek chunk (Tukda)
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    
    // Unique ID generated for this specific session so Cloudinary merges correctly
    const uniqueUploadId = 'talkink_chunk_' + Math.random().toString(36).substring(2, 15);

    // Recursive function to upload chunk by chunk
    function uploadNextChunk() {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunkBlob = file.slice(start, end); // File ko physically cut kiya browser me

        const formData = new FormData();
        formData.append('file', chunkBlob);
        formData.append('upload_preset', currentNodeConfig.uploadPreset);
        
        // Cloudinary triggers requirement for chunk management headers
        const uploadUrl = `https://api.cloudinary.com/v1_1/${currentNodeConfig.cloudName}/${resourceType}/upload`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);

        // Content-Range header sends current chunk bytes info to server
        xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
        xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${file.size}`);

        // 🕒 1. FAKE PROGRESS LAYER: 0% pe freeze hone se bachane ke liye smooth custom animation matrix
        let fakeProgress = Math.round((start / file.size) * 100);
        const maxFakeLimit = Math.round((end / file.size) * 100) - 1;

        const progressInterval = setInterval(() => {
            if (fakeProgress < maxFakeLimit) {
                // Har 100ms me randomly 1% se 3% bar ko smoothly aage badhayega
                fakeProgress += Math.floor(Math.random() * 3) + 1; 
                const displayPercent = Math.min(fakeProgress, maxFakeLimit, 99);
                
                barFill.style.width = `${displayPercent}%`;
                percentLabel.innerText = `${displayPercent}%`;
                statusLabel.innerText = `Streaming Packet (${currentChunk + 1}/${totalChunks})...`;
            }
        }, 100);

        // 📊 2. REAL PROGRESS TRACKER: Network upload speed ko measure karne ke liye
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                const totalBytesUploadedSoFar = start + e.loaded;
                const totalPercentage = Math.round((totalBytesUploadedSoFar / file.size) * 100);
                
                // Content registry sync status values
                const displayPercent = Math.min(totalPercentage, 99); 
                
                // Agar real network upload fake interval se aage nikal jata hai, toh fluid UI shift hoga
                if (displayPercent > fakeProgress) {
                    barFill.style.width = `${displayPercent}%`;
                    percentLabel.innerText = `${displayPercent}%`;
                }
                
                statusLabel.innerText = `Streaming Packet (${currentChunk + 1}/${totalChunks}): ${(totalBytesUploadedSoFar / (1024 * 1024)).toFixed(1)} MB / ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
            }
        };

        xhr.onload = function () {
            clearInterval(progressInterval); // Safely clear interval timer instance
            
            if (xhr.status === 200 || xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                currentChunk++;

                if (currentChunk < totalChunks) {
                    // Agla tukda bhejo
                    uploadNextChunk();
                } else {
                    // All Chunks Uploaded successfully! Cloudinary returns single URL now
                    barFill.style.width = '100%';
                    percentLabel.innerText = '100%';
                    statusLabel.innerText = '✅ Node Sync Success! Asset Secured.';
                    statusLabel.style.color = '#10b981';
 
 // 🔥 Yeh line data ko seedhe Firestore me bhej degi!
saveUploadMetadataToFirestore(file.name, response.secure_url, activeNodeState.id);

                   
                    
                    setTimeout(() => {
                        const panelCard = document.querySelector('.upload-panel-card');
                        if (panelCard) {
                            panelCard.innerHTML = `
                                <div class="success-interface-wrapper">
                                    <div class="success-glow-ring"><i class="fa-solid fa-circle-check"></i></div>
                                    <h3>Transmission Secured!</h3>
                                    <p class="success-sub">Asset successfully synchronized with Cloudinary Node 0${activeNodeState.id}</p>
                                    
                                    <div class="url-vault-box">
                                        <input type="text" id="secureCloudUrl" value="${response.secure_url}" readonly autocomplete="off">
                                        <button class="copy-vault-btn" onclick="copyUrlToClipboard()">
                                            <i class="fa-solid fa-copy"></i> <span id="copyBtnText">Copy URL</span>
                                        </button>
                                    </div>
                                    
                                    <button class="panel-dismiss-btn" onclick="destroyUploadPanel()">
                                        <i class="fa-solid fa-circle-xmark"></i> Close Upload Gateway
                                    </button>
                                </div>
                            `;
                        }
                    }, 800);
                }
            } else {
                const response = JSON.parse(xhr.responseText);
                console.error("Cloudinary Chunk Rejected:", response);
                statusLabel.innerText = `❌ Error: ${response.error ? response.error.message : 'Chunk Failed'}`;
                statusLabel.style.color = '#ef4444';
                barFill.style.backgroundColor = '#ef4444';
                
                fireBtn.removeAttribute('disabled');
                fireBtn.classList.add('btn-ready');
            }
        };

        xhr.onerror = function () {
            clearInterval(progressInterval); // Safe clear on network breakdown
            statusLabel.innerText = "❌ Network Interruption Detected.";
            statusLabel.style.color = '#ef4444';
            fireBtn.removeAttribute('disabled');
            fireBtn.classList.add('btn-ready');
        };

        xhr.send(formData);
    }

    // Start streaming the first chunk loop
    uploadNextChunk();
}






/**
 * 📋 8. BULLETPROOF COPY SYSTEM WITH OLDER BROWSER/MOBILE FALLBACK
 * Module scope friendly rewrite for TalkInk PWA environment.
 */
window.copyUrlToClipboard = function() {
    const urlInput = document.getElementById('secureCloudUrl');
    const copyBtnText = document.getElementById('copyBtnText');
    const copyBtnIcon = document.querySelector('.copy-vault-btn i');

    if (!urlInput) return;

    // Highlight and Select Text Focus
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); 

    // Success UI Feedback Helper Function Matrix
    const triggerSuccessUI = () => {
        copyBtnText.innerText = "Copied!";
        urlInput.classList.add('copied-flash');
        if (copyBtnIcon) copyBtnIcon.className = "fa-solid fa-check";

        setTimeout(() => {
            copyBtnText.innerText = "Copy URL";
            urlInput.classList.remove('copied-flash');
            if (copyBtnIcon) copyBtnIcon.className = "fa-solid fa-copy";
        }, 2000);
    };

    // Protocol 1: Modern Clipboard API execution
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(urlInput.value)
            .then(() => { triggerSuccessUI(); })
            .catch(() => { runFallbackCopy(urlInput, triggerSuccessUI); });
    } else {
        // Protocol 2: Fallback for WebViews or sandbox mobile layers
        runFallbackCopy(urlInput, triggerSuccessUI);
    }
}

// Executed when modern clipboard API blocks on Android/iOS webviews
function runFallbackCopy(inputElement, successCallback) {
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            successCallback();
        } else {
            alert("Bhai text select ho gaya hai, aap manual hold karke copy kar lijiye!");
        }
    } catch (err) {
        console.error('Fallback execution error:', err);
    }
}









/**
 * 🔒 9. DESTROYS FULLSCREEN OVERLAY PANEL
 * Module scope wrapper to bind clean UI collapse.
 */
window.destroyUploadPanel = function() {
    let panel = document.getElementById('fullscreenUploadPanel');
    if (panel) {
        panel.classList.remove('panel-overlay-active');
        setTimeout(() => { panel.remove(); }, 300);
    }
}

window.onclick = function(event) {
    let modal = document.getElementById('accountPortalModal');
    if (event.target === modal) {
        if (typeof closeAccountPortal === 'function') closeAccountPortal();
    }
};














// =========================================================================
// 🌐 SUPABASE SPECIFIC BYPASS PROTOCOL ENGINE (ADD-ON)
// =========================================================================

// 🔑 SETUP: Project credentials matrix
const SUPABASE_URL = "https://ydztexavjbuhizknidhj.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_iuTHCxnzFqHTz1frviEHtw_WznIiXpG";

// Safe Initializer connection without breaking runtime scopes
const supaVaultClient = typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/**
 * 🚀 1. TRIGGER SUPABASE UNIQUE FULLSCREEN OVERLAY
 * Active block when user handles the special green bypass node (Box 7).
 */
window.triggerSupabaseUploadSystem = function(nodeCustomName) {
    if (typeof closeAccountPortal === 'function') closeAccountPortal();

    let uploadOverlay = document.createElement('div');
    uploadOverlay.id = 'fullscreenUploadPanel';
    uploadOverlay.className = 'upload-fullscreen-overlay';
    
    uploadOverlay.innerHTML = `
        <div class="upload-panel-card" style="border: 1px solid rgba(16, 185, 129, 0.25);">
            <div class="panel-header">
                <div class="node-badge-info" style="color: #10b981; background: rgba(16, 185, 129, 0.1);">
                    <i class="fa-solid fa-bolt"></i> SUPABASE_BYPASS_ACTIVE
                </div>
                <button class="panel-close-btn" onclick="destroyUploadPanel()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="panel-meta-info">
                <h3>Supabase High-Capacity Gateway</h3>
                <p>Target Node: <span class="highlight-text" style="color: #10b981;">${nodeCustomName}</span></p>
                <p class="preset-debug">Protocol restriction: <span style="color: #10b981;">Infinite Scope (Bypass 10MB Limit)</span></p>
            </div>

            <div class="dropzone-area" id="dropzoneContainer" onclick="document.getElementById('supaFileSourceInput').click()">
                <input type="file" id="supaFileSourceInput" style="display:none;" onchange="processSupaFilePreview(this)">
                <div class="dropzone-default-view" id="dropzoneDefaultView">
                    <div class="cloud-bounce-icon" style="color: #10b981;"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="main-drop-text">Click or Drag large file here to stage</p>
                    <p class="sub-drop-text">Direct high-speed streaming tunnel</p>
                </div>
                
                <div class="dropzone-preview-view" id="dropzonePreviewView" style="display:none;">
                    <div id="visualPreviewContainer" class="preview-media-holder"></div>
                    <div class="file-meta-tag" id="fileMetaTag">file_name.jpg</div>
                </div>
            </div>

            <div class="progress-telemetry-box" id="progressTelemetryBox" style="display:none;">
                <div class="progress-status-row">
                    <span id="uploadStatusLabel">Establishing handshake...</span>
                    <span id="progressPercentageLabel">0%</span>
                </div>
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" id="progressBarFill" style="width: 0%; background: #10b981; box-shadow: 0 0 10px #10b981;"></div>
                </div>
            </div>

            <button class="fire-upload-btn" id="fireSupaUploadBtn" disabled onclick="executeSupabaseDirectTransfer()" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%);">
                <i class="fa-solid fa-bolt"></i> Fire Supabase Stream
            </button>
        </div>
    `;

    document.body.appendChild(uploadOverlay);
    setTimeout(() => { uploadOverlay.classList.add('panel-overlay-active'); }, 10);
}

/**
 * 📸 2. FILE PREVIEW CONTROLLER SPECIFIC TO SUPABASE ONLY
 */
window.processSupaFilePreview = function(input) {
    const file = input.files[0];
    if (!file) return;

    const defaultView = document.getElementById('dropzoneDefaultView');
    const previewView = document.getElementById('dropzonePreviewView');
    const visualContainer = document.getElementById('visualPreviewContainer');
    const metaTag = document.getElementById('fileMetaTag');
    const fireBtn = document.getElementById('fireSupaUploadBtn');

    metaTag.innerText = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    defaultView.style.display = 'none';
    previewView.style.display = 'flex';
    visualContainer.innerHTML = '';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            visualContainer.innerHTML = `<img src="${e.target.result}" alt="Preview Staged Asset">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        visualContainer.innerHTML = `<div class="doc-preview-icon" style="color: #10b981;"><i class="fa-solid fa-file-pdf"></i><p>PDF Document</p></div>`;
    } else {
        visualContainer.innerHTML = `<div class="doc-preview-icon" style="color: #10b981;"><i class="fa-solid fa-file-code"></i><p>Binary Asset File</p></div>`;
    }

    fireBtn.removeAttribute('disabled');
    fireBtn.classList.add('btn-ready');
}

/**
 * ⚡ 3. SUPABASE DIRECT LIVE TRANSFER EXECUTION
 * Sync pipeline coupled to deploy absolute metadata path into Firestore collection.
 */
window.executeSupabaseDirectTransfer = async function() {
    const fileInput = document.getElementById('supaFileSourceInput');
    const file = fileInput.files[0];
    if (!file) return;

    if (!supaVaultClient || SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL") {
        alert("❌ Configuration Missing: Please update SUPABASE_URL and key at the bottom of script.js!");
        return;
    }

    const fireBtn = document.getElementById('fireSupaUploadBtn');
    const telemetryBox = document.getElementById('progressTelemetryBox');
    const barFill = document.getElementById('progressBarFill');
    const percentLabel = document.getElementById('progressPercentageLabel');
    const statusLabel = document.getElementById('uploadStatusLabel');

    fireBtn.setAttribute('disabled', 'true');
    telemetryBox.style.display = 'block';

    // Filename collision safe logic
    const cleanedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const folderPath = file.type.startsWith('image/') ? 'talkink_images' : 'talkink_pdfs';
    const finalStoragePath = `${folderPath}/${cleanedFileName}`;

    statusLabel.innerText = "Securing socket. Uploading stream...";
    
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
        if (fakeProgress < 92) {
            fakeProgress += Math.floor(Math.random() * 6) + 2;
            barFill.style.width = `${fakeProgress}%`;
            percentLabel.innerText = `${fakeProgress}%`;
        }
    }, 150);

    try {
        // Direct flight asset deployment to bucket
        const { data, error } = await supaVaultClient.storage
            .from('talkink_vault')
            .upload(finalStoragePath, file, { cacheControl: '3600', upsert: false });

        clearInterval(progressInterval);
        if (error) throw error;

        // Fetch instant public absolute url
        const { data: urlData } = supaVaultClient.storage
            .from('talkink_vault')
            .getPublicUrl(finalStoragePath);

        const secureUrl = urlData.publicUrl;

        // 🔥 FIRESTORE METADATA INJECTION PIPELINE
        // Supabase represents the bypass engine (Let's stamp it to Box 7)
        const activeBoxId = activeNodeState.id || 7; 
        if (typeof saveUploadMetadataToFirestore === 'function') {
            await saveUploadMetadataToFirestore(file.name, secureUrl, activeBoxId);
        }

        barFill.style.width = '100%';
        percentLabel.innerText = '100%';
        statusLabel.innerText = '✅ Node Sync Success! Asset Secured.';
        statusLabel.style.color = '#10b981';

        setTimeout(() => {
            const panelCard = document.querySelector('.upload-panel-card');
            if (panelCard) {
                panelCard.innerHTML = `
                    <div class="success-interface-wrapper">
                        <div class="success-glow-ring" style="color: #10b981; filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <h3>Supabase Transmission Secured!</h3>
                        <p class="success-sub">Bypass node active. Asset cached and synced to Database.</p>
                        
                        <div class="url-vault-box">
                            <input type="text" id="secureCloudUrl" value="${secureUrl}" readonly autocomplete="off">
                            <button class="copy-vault-btn" onclick="copyUrlToClipboard()" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%);">
                                <i class="fa-solid fa-copy"></i> <span id="copyBtnText">Copy URL</span>
                            </button>
                        </div>
                        
                        <button class="panel-dismiss-btn" onclick="destroyUploadPanel()">
                            <i class="fa-solid fa-circle-xmark"></i> Close Upload Gateway
                        </button>
                    </div>
                `;
            }
        }, 800);

    } catch (err) {
        clearInterval(progressInterval);
        console.error("Supabase Engine Routing Crash:", err);
        statusLabel.innerText = `❌ Error: ${err.message || 'Transmission Terminated'}`;
        statusLabel.style.color = '#ef4444';
        barFill.style.backgroundColor = '#ef4444';
        fireBtn.removeAttribute('disabled');
    }
}















// =========================================================================
// 📊 TELEMETRY FILES REGISTRY & PAGINATION ENGINE (30 ITEMS MATRIX)
// =========================================================================

// Pagination State Controls
let paginationState = {
    currentBoxId: null,
    currentPage: 1,
    limitPerPage: 30,
    allBoxDocuments: [], // Local cache to handle offline/smooth fluid pagination switching
};

import { query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * 🚀 1. TELEMETRY INITIALIZER PORTAL
 * Triggered when user selects "All Files Details" inside the account portal card.
 */
window.handleProtocolSelection = async function(mode) {
    if (mode === 'details') {
        if (typeof closeAccountPortal === 'function') closeAccountPortal();
        
        const targetBoxId = Number(activeNodeState.id);
        const targetBoxName = activeNodeState.name;
        
        console.log(`📡 Fetching registry for Box ${targetBoxId}: ${targetBoxName}...`);
        
        // Loader interface trigger while fetching data stream
        const filesPage = document.getElementById('filesPage');
        if (filesPage) {
            filesPage.innerHTML = `<div class="vault-core-loader">Syncing Vault Registry Core...</div>`;
            filesPage.style.display = 'block';
            
            const mainContainer = document.querySelector('main');
            if (mainContainer) mainContainer.style.display = 'none';
        }

        // Initialize state configuration data
        paginationState.currentBoxId = targetBoxId;
        paginationState.currentPage = 1;
        paginationState.allBoxDocuments = [];

        await fetchAllBoxMetadataFromFirestore(targetBoxId);
    }
}

/**
 * 📥 2. CORES METADATA FETCH ROUTER FROM FIRESTORE
 * Fetches all indexed files for the active node to calculate absolute count and build the cache array.
 */
async function fetchAllBoxMetadataFromFirestore(boxId) {
    try {
        const uploadCollectionRef = collection(db, "uploads");
        
        // Query to filter data matching current boxId sorted by newest timestamp
        const q = query(
            uploadCollectionRef, 
            where("boxId", "==", Number(boxId)),
            orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            paginationState.allBoxDocuments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Trigger Render Engine pipeline
        renderFilesPageUI();

    } catch (error) {
        console.error("❌ [Telemetry Sync Error]: Failed to fetch document matrix:", error);
        const filesPage = document.getElementById('filesPage');
        if (filesPage) {
            filesPage.innerHTML = `<div class="vault-sync-error">Critical connection failure to cloud registry.</div>`;
        }
    }
}

/**
 * 🎨 3. CORE TELEMETRY UI RENDER ENGINE
 * Handles structural HTML injection with premium minimalist structure tags.
 */
function renderFilesPageUI() {
    const filesPage = document.getElementById('filesPage');
    if (!filesPage) return;

    const totalFilesCount = paginationState.allBoxDocuments.length;
    const startIndex = (paginationState.currentPage - 1) * paginationState.limitPerPage;
    const endIndex = startIndex + paginationState.limitPerPage;
    
    // Slice only the 30 files required for the current active page view window
    const paginatedFilesChunk = paginationState.allBoxDocuments.slice(startIndex, endIndex);

    // Header Meta Configuration Template
    let htmlPayload = `
        <div class="telemetry-vault-container">
            <div class="telemetry-header-bar">
                <div class="telemetry-title-meta">
                    <button class="vault-back-btn" onclick="window.exitTelemetryView()">
                        <i class="fa-solid fa-arrow-left-long"></i> Back to Fleet
                    </button>
                    <h2>Registry: ${activeNodeState.name}</h2>
                </div>
                <div class="telemetry-counter-badge">
                    Total Files Index: <span class="count-highlight">${totalFilesCount}</span>
                </div>
            </div>
    `;

    // Empty State Check Guard Clause
    if (totalFilesCount === 0) {
        htmlPayload += `
            <div class="empty-vault-placeholder">
                <i class="fa-solid fa-folder-open"></i>
                <p>No secure assets synchronized inside Storage Node 0${paginationState.currentBoxId}</p>
            </div>
        </div>`;
        filesPage.innerHTML = htmlPayload;
        return;
    }

    // 🕒 Grid System Setup: 3-Column structural layout generator
    htmlPayload += `<div class="telemetry-files-grid">`;

    paginatedFilesChunk.forEach((file) => {
        // Evaluate dynamic icon layout matrix depending on file extension profile
        let assetIconHTML = `<i class="fa-solid fa-file-code"></i>`;
        if (file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i) || (file.url && file.url.includes('talkink_images'))) {
            assetIconHTML = `<i class="fa-solid fa-file-image"></i>`;
        } else if (file.name.match(/\.(pdf)$/i) || (file.url && file.url.includes('talkink_pdfs'))) {
            assetIconHTML = `<i class="fa-solid fa-file-pdf"></i>`;
        }

        htmlPayload += `
            <div class="asset-card-node" onclick="window.showFileDetails('${file.id}')">
                <div class="asset-icon-wrapper">${assetIconHTML}</div>
                <div class="asset-details-meta">
                    <h4 class="asset-title-truncate">${file.name}</h4>
                    <p class="asset-date-stamp">${window.formatTelemetryTimestamp(file.timestamp)}</p>
                </div>
            </div>
        `;
    });

    htmlPayload += `</div>`; // Grid layout termination tag

    // 🎛️ Pagination Control Bar Router Generator
    const totalPagesPossible = Math.ceil(totalFilesCount / paginationState.limitPerPage);
    
    if (totalPagesPossible > 1) {
        htmlPayload += `
            <div class="telemetry-pagination-bar">
                <button class="pag-nav-btn" id="prevPagBtn" ${paginationState.currentPage === 1 ? 'disabled' : ''} onclick="window.navigateTelemetryPage('prev')">
                    <i class="fa-solid fa-angle-left"></i> Previous
                </button>
                <span class="pag-indicator-text">Page ${paginationState.currentPage} of ${totalPagesPossible}</span>
                <button class="pag-nav-btn" id="nextPagBtn" ${paginationState.currentPage === totalPagesPossible ? 'disabled' : ''} onclick="window.navigateTelemetryPage('next')">
                    Next <i class="fa-solid fa-angle-right"></i>
                </button>
            </div>
        `;
    }

    htmlPayload += `</div>`; // Master structural wrapper termination tag
    filesPage.innerHTML = htmlPayload;
}

/**
 * 🔀 4. PAGINATION CLICK CONTROLLER
 */
window.navigateTelemetryPage = function(direction) {
    if (direction === 'next') {
        const totalPagesPossible = Math.ceil(paginationState.allBoxDocuments.length / paginationState.limitPerPage);
        if (paginationState.currentPage < totalPagesPossible) {
            paginationState.currentPage++;
            renderFilesPageUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else if (direction === 'prev') {
        if (paginationState.currentPage > 1) {
            paginationState.currentPage--;
            renderFilesPageUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

/**
 * 🚪 5. EXIT VIEW PORTAL
 * Collapses file registry visualization panel and restores main screen grid interface state.
 */
window.exitTelemetryView = function() {
    const filesPage = document.getElementById('filesPage');
    if (filesPage) {
        filesPage.innerHTML = '';
        filesPage.style.display = 'none';
    }

    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.style.display = 'block';
}

/**
 * 🔍 6. FILE METADATA DETAIL VIEWER (STUB INTERFACE)
 * Callback trigger pipeline executed on explicit click of any active asset block array element.
 */
window.showFileDetails = function(documentId) {
    // Find the current localized file object instance context from state array cache
    const targetFileObject = paginationState.allBoxDocuments.find(doc => doc.id === documentId);
    if (!targetFileObject) return;

    console.log("🎯 Inspection Target Staged successfully:", targetFileObject);
    
    // Bhai yahan par hum baad me details modal open karne ka logic bind karenge, jaise aapne kaha.
    alert(`🔍 Asset Inspection Triggered:\nName: ${targetFileObject.name}\nBox Reference: 0${targetFileObject.boxId}`);
}

/**
 * 🕒 7. TIMESTAMP FORMATTING HELPER MATRIX
 */
window.formatTelemetryTimestamp = function(isoString) {
    if (!isoString) return "Date Unknown";
    try {
        const dateObj = new Date(isoString);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch(e) {
        return "Parsing Error";
    }
}














/**
 * 🔍 6. FILE METADATA DETAIL VIEWER (FULLSCREEN INSPECT ENGINE)
 * Triggers a premium responsive overlay view showcasing metadata registry and asset renders.
 */
window.showFileDetails = function(documentId) {
    // State cache array se target file object ka contextual instance fetch karo
    const targetFileObject = paginationState.allBoxDocuments.find(doc => doc.id === documentId);
    if (!targetFileObject) return;

    console.log("🎯 Inspection Protocol Initialized for asset:", targetFileObject);

    // Pehle se agar koi inspect panel portal active ho toh safety clean up karo
    window.destroyInspectPanel();

    let inspectOverlay = document.createElement('div');
    inspectOverlay.id = 'fullscreenInspectPanel';
    inspectOverlay.className = 'inspect-fullscreen-overlay';

    // 🖼️ Media Render Pipeline Validator logic
    let mediaVisualPreviewHTML = '';
    const isImage = targetFileObject.name.match(/\.(jpeg|jpg|png|gif|webp)$/i) || 
                    (targetFileObject.url && targetFileObject.url.includes('talkink_images'));
    
    const isPdf = targetFileObject.name.match(/\.(pdf)$/i) || 
                  (targetFileObject.url && targetFileObject.url.includes('talkink_pdfs'));

    if (isImage) {
        // Full frame responsive image containment pipeline without clipping boundaries
        mediaVisualPreviewHTML = `
            <div class="inspect-media-container image-type">
                <img src="${targetFileObject.url}" alt="Vault Secure Asset Master" class="inspect-img-render">
            </div>
        `;
    } else if (isPdf) {
        // Document placeholder framework linked to direct chrome navigation protocol
        mediaVisualPreviewHTML = `
            <div class="inspect-media-container document-type">
                <div class="inspect-doc-badge">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span>PDF Core Document</span>
                </div>
                <a href="${targetFileObject.url}" target="_blank" rel="noopener noreferrer" class="chrome-stream-btn">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open In Chrome Native Viewer
                </a>
            </div>
        `;
    } else {
        // Universal binary asset fallback setup
        mediaVisualPreviewHTML = `
            <div class="inspect-media-container binary-type">
                <div class="inspect-doc-badge">
                    <i class="fa-solid fa-file-code"></i>
                    <span>Secure Binary Vault Stream</span>
                </div>
                <a href="${targetFileObject.url}" target="_blank" rel="noopener noreferrer" class="chrome-stream-btn">
                    <i class="fa-solid fa-download"></i> Open Link Protocol
                </a>
            </div>
        `;
    }

    // 📋 Dynamic Registry Payload Builder (Firestore fields extraction loop mapping)
    inspectOverlay.innerHTML = `
        <div class="inspect-panel-card">
            <div class="inspect-header">
                <div class="inspect-badge-info">
                    <span class="secure-pulse-dot"></span> SECURE_ASSET_INSPECTION
                </div>
                <button class="inspect-close-btn" onclick="window.destroyInspectPanel()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            ${mediaVisualPreviewHTML}

            <div class="inspect-metadata-ledger">
                <div class="meta-field-row">
                    <span class="meta-label-tag"><i class="fa-solid fa-signature"></i> File Registry Name</span>
                    <span class="meta-value-data global-text-selectable">${targetFileObject.name}</span>
                </div>
                
                <div class="meta-field-row">
                    <span class="meta-label-tag"><i class="fa-solid fa-cube"></i> Storage Node Target</span>
                    <span class="meta-value-data">Box Node 0${targetFileObject.boxId}</span>
                </div>

                <div class="meta-field-row">
                    <span class="meta-label-tag"><i class="fa-solid fa-calendar-day"></i> Timestamp Locked</span>
                    <span class="meta-value-data">${window.formatTelemetryTimestamp(targetFileObject.timestamp)}</span>
                </div>

                <div class="meta-field-row">
                    <span class="meta-label-tag"><i class="fa-solid fa-shield-halved"></i> Security Status</span>
                    <span class="meta-value-data status-vault-stamped">${targetFileObject.status ? targetFileObject.status.toUpperCase() : 'SECURED_IN_VAULT'}</span>
                </div>

                <div class="meta-field-row path-url-matrix-row">
                    <span class="meta-label-tag"><i class="fa-solid fa-link"></i> CDN Cryptographic Absolute Link</span>
                    <div class="url-vault-box inner-inspect-box">
                        <input type="text" id="secureCloudUrl" value="${targetFileObject.url}" readonly autocomplete="off">
                        <button class="copy-vault-btn" onclick="window.copyUrlToClipboard()">
                            <i class="fa-solid fa-copy"></i> <span id="copyBtnText">Copy URL</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(inspectOverlay);
    setTimeout(() => { inspectOverlay.classList.add('inspect-overlay-active'); }, 10);
};

/**
 * 🔒 7. DESTROYS ASSET INSPECTION PANEL OVERLAY
 * Collapses and removes the dynamic overlay element gracefully.
 */
window.destroyInspectPanel = function() {
    const inspectPanel = document.getElementById('fullscreenInspectPanel');
    if (inspectPanel) {
        inspectPanel.classList.remove('inspect-overlay-active');
        setTimeout(() => { inspectPanel.remove(); }, 250);
    }
};
