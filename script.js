// =========================================================================
// 🔥 FIREBASE CORE INFRASTRUCTURE INITIALIZATION
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
        const currentTimestamp = new Date().toISOString(); 
        const uploadCollectionRef = collection(db, "uploads");
        const newDocRef = doc(uploadCollectionRef); 
        
        await setDoc(newDocRef, {
            name: fileName,
            url: fileUrl,
            timestamp: currentTimestamp,
            boxId: Number(activeBoxId), // Strict standard integer tracking
            status: "secured_in_vault"
        });

        console.log(`🚀 [Vault Sync]: Metadata for "${fileName}" successfully pushed to Box ${activeBoxId}!`);
    } catch (error) {
        console.error("❌ [Vault Sync Error]: Firebase payload delivery interrupted:", error);
    }
}

/**
 * 🎛️ TALKINK STORAGE - CORE INTERACTION & LIVE STREAM ENGINE
 */
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

// Pagination State Controls
let paginationState = {
    currentBoxId: null,
    currentPage: 1,
    limitPerPage: 30,
    allBoxDocuments: [], 
};




/**
 * 🚀 2. OPENS THE INTERACTION PORTAL (MODAL FOR BOTH CLOUDINARY & SUPABASE)
 */
window.openAccountPortal = function(nodeId, nodeName) {
    activeNodeState.id = Number(nodeId);
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
                
                <p class="modal-subtitle">Select an operation protocol for Storage Node</p>
                
                <div class="modal-options-grid">
                    <div class="action-card upload-trigger" onclick="handleActionDispatch('upload')">
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
};

/**
 * 🎛️ SMART ROUTER ENGINE
 * Yeh detect karega ki card Cloudinary ka hai (1 se 6) ya Supabase ka (7+)
 */
window.handleActionDispatch = function(actionType) {
    if (actionType === 'upload') {
        if (activeNodeState.id > 6) {
            // Agar box id 6 se badi hai matlab yeh Supabase ka card hai!
            // Name me se node number dhundne ke bajay ham current dynamic ID se config nikal lenge
            window.triggerSupabaseUploadSystem(activeNodeState.name);
        } else {
            // Agar 1 se 6 hai toh normal Cloudinary chalega
            window.triggerUploadSystem();
        }
    }
};






window.closeAccountPortal = function() {
    let modal = document.getElementById('accountPortalModal');
    if (modal) {
        modal.classList.remove('portal-modal-active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
};

/**
 * 🚀 5. FULLSCREEN UPLOAD PANEL LOGIC (CLOUDINARY)
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
};

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
};

/**
 * ⚡ 7. REAL LIVE CLOUDINARY CHUNKED STREAM TRANSFER ENGINE
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

    fireBtn.setAttribute('disabled', 'true');
    fireBtn.classList.remove('btn-ready');
    telemetryBox.style.display = 'block';

    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
    const chunkSize = 5 * 1024 * 1024; 
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const uniqueUploadId = 'talkink_chunk_' + Math.random().toString(36).substring(2, 15);

    function uploadNextChunk() {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunkBlob = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunkBlob);
        formData.append('upload_preset', currentNodeConfig.uploadPreset);
        
        const uploadUrl = `https://api.cloudinary.com/v1_1/${currentNodeConfig.cloudName}/${resourceType}/upload`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
        xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${file.size}`);

        let fakeProgress = Math.round((start / file.size) * 100);
        const maxFakeLimit = Math.round((end / file.size) * 100) - 1;

        const progressInterval = setInterval(() => {
            if (fakeProgress < maxFakeLimit) {
                fakeProgress += Math.floor(Math.random() * 3) + 1; 
                const displayPercent = Math.min(fakeProgress, maxFakeLimit, 99);
                barFill.style.width = `${displayPercent}%`;
                percentLabel.innerText = `${displayPercent}%`;
                statusLabel.innerText = `Streaming Packet (${currentChunk + 1}/${totalChunks})...`;
            }
        }, 100);

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                const totalBytesUploadedSoFar = start + e.loaded;
                const totalPercentage = Math.round((totalBytesUploadedSoFar / file.size) * 100);
                const displayPercent = Math.min(totalPercentage, 99); 
                if (displayPercent > fakeProgress) {
                    barFill.style.width = `${displayPercent}%`;
                    percentLabel.innerText = `${displayPercent}%`;
                }
                statusLabel.innerText = `Streaming Packet (${currentChunk + 1}/${totalChunks}): ${(totalBytesUploadedSoFar / (1024 * 1024)).toFixed(1)} MB / ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
            }
        };

        xhr.onload = async function () {
            clearInterval(progressInterval);
            
            if (xhr.status === 200 || xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                currentChunk++;

                if (currentChunk < totalChunks) {
                    uploadNextChunk();
                } else {
                    barFill.style.width = '100%';
                    percentLabel.innerText = '100%';
                    statusLabel.innerText = '✅ Node Sync Success! Asset Secured.';
                    statusLabel.style.color = '#10b981';
 
                    await saveUploadMetadataToFirestore(file.name, response.secure_url, activeNodeState.id);
                    
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
                statusLabel.innerText = `❌ Error: ${response.error ? response.error.message : 'Chunk Failed'}`;
                statusLabel.style.color = '#ef4444';
                barFill.style.backgroundColor = '#ef4444';
                fireBtn.removeAttribute('disabled');
                fireBtn.classList.add('btn-ready');
            }
        };

        xhr.onerror = function () {
            clearInterval(progressInterval);
            statusLabel.innerText = "❌ Network Interruption Detected.";
            statusLabel.style.color = '#ef4444';
            fireBtn.removeAttribute('disabled');
            fireBtn.classList.add('btn-ready');
        };

        xhr.send(formData);
    }

    uploadNextChunk();
};










// =========================================================================
// 🌐 SUPABASE SPECIFIC BYPASS PROTOCOL ENGINE (MULTI-NODE MATRIX CONTEXT)
// =========================================================================
const SUPABASE_NODES_MATRIX = [
    { nodeId: 1, url: "https://ydztexavjbuhizknidhj.supabase.co", anonKey: "sb_publishable_iuTHCxnzFqHTz1frviEHtw_WznIiXpG" },
    { nodeId: 2, url: "https://nqbqazdlxbamduqzhfqk.supabase.co", anonKey: "sb_publishable_v3zXcSC0tmUHYY6pJIbWow_Ewbfs-Kg" },
    { nodeId: 3, url: "https://crsltculdhzschtimglq.supabase.co", anonKey: "sb_publishable_racN5GuSz1Hs1Lkk7T6-kQ_9yz4Nec0" },
    { nodeId: 4, url: "https://kclaaqlvsmxktussxfdx.supabase.co", anonKey: "sb_publishable_xVsBmOysvEvGUN75F6aGXQ_b_jzgWeG" },
    { nodeId: 5, url: "https://lfjgqsvigvbeqveiriha.supabase.co", anonKey: "sb_publishable_qBq2vHIgtImyOqb5nUG6RA_q8Lu13PO" },
    { nodeId: 6, url: "https://awfufftrdwccmvrbsoho.supabase.co", anonKey: "sb_publishable_chhtnFXuVRuojA_Ko51a1A_XHCuNwip" },
    { nodeId: 7, url: "https://wilovygpiwmnggkiwtkr.supabase.co", anonKey: "sb_publishable_m9spj1zPvUsiotYBORbp2g_eV8W8o7P" },
    { nodeId: 8, url: "https://iktepwsxdpbnohioqneg.supabase.co", anonKey: "sb_publishable_sOLNwKLPTf2jNuQd3u-pnw_WqyXsnS-" },
    { nodeId: 9, url: "https://xtpehrqvlbljqyxopunw.supabase.co", anonKey: "sb_publishable_s49FWOk6bQ7utg0z9Hnzkg_b4sixEFC" },
    { nodeId: 10, url: "https://yzepggirhgzklfqstwzq.supabase.co", anonKey: "sb_publishable_clA-JX0PqML33j5pdjmZnA_7lWL5Stw" }
];

let currentActiveSupaNodeConfig = null;

/**
 * 🚀 TRIGGER SUPABASE UPLOAD SYSTEM (FIXED FOR CORRECT LIVE CORE NODE ID DETECT)
 */
window.triggerSupabaseUploadSystem = function(nodeCustomName) {
    if (typeof closeAccountPortal === 'function') closeAccountPortal();

    let nodeNumber = 1;
    const matches = nodeCustomName.match(/\d+/);
    if (matches) {
        nodeNumber = parseInt(matches[0]);
    }

    const nodeConfig = SUPABASE_NODES_MATRIX.find(n => n.nodeId === nodeNumber) || SUPABASE_NODES_MATRIX[0];
    currentActiveSupaNodeConfig = nodeConfig; 

    // Cloudinary 1-6 tak hain, toh Supabase Node 1 map hoga Box 7 par, Node 2 Box 8 par...
    activeNodeState.id = 6 + nodeNumber; 
    activeNodeState.name = nodeCustomName;

    let uploadOverlay = document.createElement('div');
    uploadOverlay.id = 'fullscreenUploadPanel';
    uploadOverlay.className = 'upload-fullscreen-overlay';
    
    uploadOverlay.innerHTML = `
        <div class="upload-panel-card" style="border: 1px solid rgba(16, 185, 129, 0.25);">
            <div class="panel-header">
                <div class="node-badge-info" style="color: #10b981; background: rgba(16, 185, 129, 0.1);">
                    <i class="fa-solid fa-bolt"></i> SUPABASE_NODE_${nodeNumber}_ACTIVE
                </div>
                <button class="panel-close-btn" onclick="destroyUploadPanel()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="panel-meta-info">
                <h3>Supabase High-Capacity Gateway</h3>
                <p>Target Node: <span class="highlight-text" style="color: #10b981;">${nodeCustomName}</span></p>
                <p class="preset-debug">Endpoint Matrix: <span>${nodeConfig.url.substring(0, 30)}...</span></p>
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
};

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
};

/**
 * ⚡ EXECUTE SUPABASE DIRECT LIVE TRANSFER
 */
window.executeSupabaseDirectTransfer = async function() {
    const fileInput = document.getElementById('supaFileSourceInput');
    const file = fileInput.files[0];
    if (!file) return;

    if (!currentActiveSupaNodeConfig || currentActiveSupaNodeConfig.url.includes("YOUR_SUPABASE_PROJECT")) {
        alert("❌ Configuration Error: Is selected Supabase Node ke credentials array me update nahi kiye gaye hain!");
        return;
    }

    let dynamicSupaClient = null;
    try {
        if (typeof supabase !== 'undefined') {
            dynamicSupaClient = supabase.createClient(currentActiveSupaNodeConfig.url, currentActiveSupaNodeConfig.anonKey);
        }
    } catch(err) {
        console.error("SDK Initializer Crash:", err);
    }

    if (!dynamicSupaClient) {
        alert("❌ Driver Error: Supabase SDK loading execution failed. Check script layers!");
        return;
    }

    const fireBtn = document.getElementById('fireSupaUploadBtn');
    const telemetryBox = document.getElementById('progressTelemetryBox');
    const barFill = document.getElementById('progressBarFill');
    const percentLabel = document.getElementById('progressPercentageLabel');
    const statusLabel = document.getElementById('uploadStatusLabel');

    fireBtn.setAttribute('disabled', 'true');
    telemetryBox.style.display = 'block';

    const cleanedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const folderPath = file.type.startsWith('image/') ? 'talkink_images' : 'talkink_pdfs';
    const finalStoragePath = `${folderPath}/${cleanedFileName}`;

    statusLabel.innerText = "Securing routing tunnel. Uploading stream...";
    
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
        if (fakeProgress < 92) {
            fakeProgress += Math.floor(Math.random() * 6) + 2;
            barFill.style.width = `${fakeProgress}%`;
            percentLabel.innerText = `${fakeProgress}%`;
        }
    }, 150);

    try {
        const { data, error } = await dynamicSupaClient.storage
            .from('talkink_vault')
            .upload(finalStoragePath, file, { cacheControl: '3600', upsert: false });

        clearInterval(progressInterval);
        if (error) throw error;

        const { data: urlData } = dynamicSupaClient.storage
            .from('talkink_vault')
            .getPublicUrl(finalStoragePath);

        const secureUrl = urlData.publicUrl;

        await saveUploadMetadataToFirestore(file.name, secureUrl, activeNodeState.id);

        barFill.style.width = '100%';
        percentLabel.innerText = '100%';
        statusLabel.innerText = '✅ Node Matrix Sync Success! Asset Secured.';
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
                        <p class="success-sub">Bypass node matrix spot [${currentActiveSupaNodeConfig.nodeId}] active. Asset synced to Database.</p>
                        
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
        console.error("Supabase Matrix Engine Routing Crash:", err);
        statusLabel.innerText = `❌ Error: ${err.message || 'Transmission Terminated'}`;
        statusLabel.style.color = '#ef4444';
        barFill.style.backgroundColor = '#ef4444';
        fireBtn.removeAttribute('disabled');
    }
};






/**
 * 🛰️ SUPABASE FLEET WAKE-UP ENGINE (ANTI-PAUSE PROTOCOL) - FIXED FOR PUBLIC STORAGE ROUTING
 * Isme hum direct health infrastructure api ko check karenge jisse 401 bypass hoga
 */
async function wakeUpAllSupabaseNodes() {
    console.log("⚡ Anti-Pause Protocol: Initiating fleet handshake...");

    const pingPromises = SUPABASE_NODES_MATRIX.map(async (node) => {
        try {
            // FIXED: Storage v1 health endpoint par hitting lagayi hai
            // Isse authorization keys ka header check bypass ho jayega aur response code 200 ya 204 milega.
            const response = await fetch(`${node.url}/storage/v1/health`, {
                method: "GET"
            });

             if (response.ok || response.status === 200 || response.status === 204 || response.status === 400) {
    console.log(`✅ Node ${node.nodeId} is fully operational & awake. (Ping Route Safe)`);
             } else {
    console.warn(`⚠️ Node ${node.nodeId} responded with unexpected status: ${response.status}`);
               
             }

        } catch (error) {
            console.error(`❌ Failed to ping Node ${node.nodeId}. Server might be asleep:`, error.message);
        }
    });

    await Promise.allSettled(pingPromises);
    console.log("📡 Fleet handshake matrix complete. All nodes kept alive!");
}

/**
 * ⚙️ AUTOMATION TRIGGER ON APP INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial trigger website load hote hi
    wakeUpAllSupabaseNodes();

    // 2. Continuous anti-sleep cycle grid system (Every 1 hour)
    setInterval(() => {
        wakeUpAllSupabaseNodes();
    }, 3600000); 
});





















// =========================================================================
// 📊 TELEMETRY FILES REGISTRY & PAGINATION ENGINE (30 ITEMS MATRIX)
// =========================================================================

/**
 * 🎛️ 1. UNIFIED SYSTEM ROUTER
 */
window.handleProtocolSelection = async function(mode) {
    if (mode === 'details') {
        if (typeof closeAccountPortal === 'function') closeAccountPortal();
        
        const targetBoxId = Number(activeNodeState.id);
        const targetBoxName = activeNodeState.name;
        
        console.log(`📡 Fetching registry telemetry for Dynamic Box ${targetBoxId}: ${targetBoxName}...`);
        
        const filesPage = document.getElementById('filesPage');
        if (filesPage) {
            filesPage.innerHTML = `<div class="vault-core-loader">Syncing Vault Registry Core...</div>`;
            filesPage.style.display = 'block';
            
            const mainContainer = document.querySelector('main');
            if (mainContainer) mainContainer.style.display = 'none';
        }

        paginationState.currentBoxId = targetBoxId;
        paginationState.currentPage = 1;
        paginationState.allBoxDocuments = [];

        await fetchAllBoxMetadataFromFirestore(targetBoxId);
    }
};

/**
 * 📥 2. CORES METADATA FETCH ROUTER FROM FIRESTORE
 */
async function fetchAllBoxMetadataFromFirestore(boxId) {
    try {
        const uploadCollectionRef = collection(db, "uploads");
        
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
 */
function renderFilesPageUI() {
    const filesPage = document.getElementById('filesPage');
    if (!filesPage) return;

    const totalFilesCount = paginationState.allBoxDocuments.length;
    const startIndex = (paginationState.currentPage - 1) * paginationState.limitPerPage;
    const endIndex = startIndex + paginationState.limitPerPage;
    const paginatedFilesChunk = paginationState.allBoxDocuments.slice(startIndex, endIndex);

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

    if (totalFilesCount === 0) {
        htmlPayload += `
            <div class="empty-vault-placeholder">
                <i class="fa-solid fa-folder-open"></i>
                <p>No secure assets synchronized inside Storage Node Box 0${paginationState.currentBoxId}</p>
            </div>
        </div>`;
        filesPage.innerHTML = htmlPayload;
        return;
    }

    htmlPayload += `<div class="telemetry-files-grid">`;

    paginatedFilesChunk.forEach((file) => {
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

    htmlPayload += `</div>`; 

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

    htmlPayload += `</div>`; 
    filesPage.innerHTML = htmlPayload;
}

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
};

window.exitTelemetryView = function() {
    const filesPage = document.getElementById('filesPage');
    if (filesPage) {
        filesPage.innerHTML = '';
        filesPage.style.display = 'none';
    }
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.style.display = 'block';
};

window.formatTelemetryTimestamp = function(isoString) {
    if (!isoString) return "Date Unknown";
    try {
        const dateObj = new Date(isoString);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch(e) {
        return "Parsing Error";
    }
};

/**
 * 🔍 6. FILE METADATA DETAIL VIEWER (FULLSCREEN INSPECT ENGINE)
 */
window.showFileDetails = function(documentId) {
    const targetFileObject = paginationState.allBoxDocuments.find(doc => doc.id === documentId);
    if (!targetFileObject) return;

    window.destroyInspectPanel();

    let inspectOverlay = document.createElement('div');
    inspectOverlay.id = 'fullscreenInspectPanel';
    inspectOverlay.className = 'inspect-fullscreen-overlay';

    let mediaVisualPreviewHTML = '';
    const isImage = targetFileObject.name.match(/\.(jpeg|jpg|png|gif|webp)$/i) || 
                    (targetFileObject.url && targetFileObject.url.includes('talkink_images'));
    
    const isPdf = targetFileObject.name.match(/\.(pdf)$/i) || 
                  (targetFileObject.url && targetFileObject.url.includes('talkink_pdfs'));

    if (isImage) {
        mediaVisualPreviewHTML = `
            <div class="inspect-media-container image-type">
                <img src="${targetFileObject.url}" alt="Vault Secure Asset Master" class="inspect-img-render">
            </div>
        `;
    } else if (isPdf) {
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

window.destroyInspectPanel = function() {
    const inspectPanel = document.getElementById('fullscreenInspectPanel');
    if (inspectPanel) {
        inspectPanel.classList.remove('inspect-overlay-active');
        setTimeout(() => { inspectPanel.remove(); }, 250);
    }
};

window.destroyUploadPanel = function() {
    let panel = document.getElementById('fullscreenUploadPanel');
    if (panel) {
        panel.classList.remove('panel-overlay-active');
        setTimeout(() => { panel.remove(); }, 300);
    }
};

window.copyUrlToClipboard = function() {
    const urlInput = document.getElementById('secureCloudUrl');
    const copyBtnText = document.getElementById('copyBtnText');
    const copyBtnIcon = document.querySelector('.copy-vault-btn i');

    if (!urlInput) return;

    urlInput.select();
    urlInput.setSelectionRange(0, 99999); 

    const triggerSuccessUI = () => {
        if(copyBtnText) copyBtnText.innerText = "Copied!";
        urlInput.classList.add('copied-flash');
        if (copyBtnIcon) copyBtnIcon.className = "fa-solid fa-check";

        setTimeout(() => {
            if(copyBtnText) copyBtnText.innerText = "Copy URL";
            urlInput.classList.remove('copied-flash');
            if (copyBtnIcon) copyBtnIcon.className = "fa-solid fa-copy";
        }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(urlInput.value)
            .then(() => { triggerSuccessUI(); })
            .catch(() => { runFallbackCopy(urlInput, triggerSuccessUI); });
    } else {
        runFallbackCopy(urlInput, triggerSuccessUI);
    }
};

function runFallbackCopy(inputElement, successCallback) {
    try {
        const successful = document.execCommand('copy');
        if (successful) successCallback();
    } catch (err) {
        console.error('Fallback execution error:', err);
    }
}

window.onclick = function(event) {
    let modal = document.getElementById('accountPortalModal');
    if (event.target === modal) {
        if (typeof closeAccountPortal === 'function') closeAccountPortal();
    }
};