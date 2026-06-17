// Theme management
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
});

// App State
let skillsList = [];
let profilePhotoBase64 = '';

// DOM Elements
const editorPanel = document.querySelector('.editor-panel');
const resumeSheet = document.getElementById('resume-sheet');

// Personal Info inputs
const inputFullname = document.getElementById('input-fullname');
const inputEmail = document.getElementById('input-email');
const inputPhone = document.getElementById('input-phone');
const inputLocation = document.getElementById('input-location');
const inputLinkedin = document.getElementById('input-linkedin');
const inputGithub = document.getElementById('input-github');
const inputSummary = document.getElementById('input-summary');
const inputPhoto = document.getElementById('input-photo');
const btnRemovePhoto = document.getElementById('btn-remove-photo');
const uploadPreviewImg = document.getElementById('upload-preview-img');
const uploadPreviewBox = document.getElementById('upload-preview-box');
const fileInfoLabel = document.getElementById('file-info-label');

// Dynamic list containers
const educationList = document.getElementById('education-list');
const experienceList = document.getElementById('experience-list');
const projectsList = document.getElementById('projects-list');

// Add buttons
const btnAddEducation = document.getElementById('btn-add-education');
const btnAddExperience = document.getElementById('btn-add-experience');
const btnAddProject = document.getElementById('btn-add-project');

// Actions
const btnSample = document.getElementById('btn-sample');
const btnClear = document.getElementById('btn-clear');
const btnDownload = document.getElementById('btn-download');

// Skills
const inputSkill = document.getElementById('input-skill');
const btnAddSkill = document.getElementById('btn-add-skill');
const formSkillsContainer = document.getElementById('form-skills-container');
const suggestionTags = document.getElementById('suggestion-tags');
const previewSkillsContainer = document.getElementById('preview-skills-container');

// Preview DOM elements
const pFullname = document.getElementById('p-fullname');
const pSummary = document.getElementById('p-summary');
const previewSummarySection = document.getElementById('preview-summary-section');
const pContactEmail = document.getElementById('p-contact-email');
const pContactPhone = document.getElementById('p-contact-phone');
const pContactLocation = document.getElementById('p-contact-location');
const pContactLinkedin = document.getElementById('p-contact-linkedin');
const pContactGithub = document.getElementById('p-contact-github');
const pContactSection = document.getElementById('preview-contact-section');

const previewExperienceList = document.getElementById('preview-experience-list');
const previewExperienceSection = document.getElementById('preview-experience-section');
const previewProjectsList = document.getElementById('preview-projects-list');
const previewProjectsSection = document.getElementById('preview-projects-section');
const previewEducationList = document.getElementById('preview-education-list');
const previewEducationSection = document.getElementById('preview-education-section');
const previewSkillsSection = document.getElementById('preview-skills-section');

const resumeAvatarLetter = document.getElementById('resume-avatar-letter');
const resumePhotoImg = document.getElementById('resume-photo-img');

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    updatePreview();
    adjustPreviewScale();
});

// Real-time Preview Scaling
function adjustPreviewScale() {
    const wrapper = document.querySelector('.preview-wrapper');
    const sheet = document.getElementById('resume-sheet');
    if (!wrapper || !sheet) return;
    const padding = 48; // 24px * 2 padding spacing
    const availableWidth = wrapper.clientWidth - padding;
    const sheetWidth = 794; // A4 standard width
    
    if (availableWidth < sheetWidth) {
        const scale = availableWidth / sheetWidth;
        sheet.style.transform = `scale(${scale})`;
        sheet.style.transformOrigin = 'top center';
        wrapper.style.height = `${1123 * scale + padding}px`;
    } else {
        sheet.style.transform = 'none';
        wrapper.style.height = 'auto';
    }
}

window.addEventListener('resize', adjustPreviewScale);

// Initials helper
function getInitials(name) {
    if (!name) return 'JD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Setup listeners
function setupEventListeners() {
    // Event delegation on form panel for live updating text inputs
    editorPanel.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // Remove error styling if user is typing
            if (e.target.classList.contains('error')) {
                e.target.classList.remove('error');
            }
            updatePreview();
        }
    });

    // Button dynamic additions
    btnAddEducation.addEventListener('click', () => addEducationItem());
    btnAddExperience.addEventListener('click', () => addExperienceItem());
    btnAddProject.addEventListener('click', () => addProjectItem());

    // Remove handlers for dynamic items (Education, Experience, Projects)
    educationList.addEventListener('click', handleRemoveItem);
    experienceList.addEventListener('click', handleRemoveItem);
    projectsList.addEventListener('click', handleRemoveItem);

    // Photo upload handlers
    inputPhoto.addEventListener('change', handlePhotoUpload);
    btnRemovePhoto.addEventListener('click', handleRemovePhoto);

    // Skills handlers
    inputSkill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(inputSkill.value);
        }
    });
    btnAddSkill.addEventListener('click', () => addSkill(inputSkill.value));
    
    suggestionTags.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge-suggest')) {
            addSkill(e.target.dataset.skill);
        }
    });
    
    formSkillsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
            const skill = btn.dataset.skill;
            removeSkill(skill);
        }
    });

    // Control bar buttons
    btnSample.addEventListener('click', fillSampleResume);
    btnClear.addEventListener('click', clearForm);
    btnDownload.addEventListener('click', downloadPDF);
}

// ----------------------------------------------------
// DYNAMIC ITEM BUILDERS (EDUCATION, EXPERIENCE, PROJECTS)
// ----------------------------------------------------
function addEducationItem(degree = '', college = '', year = '', cgpa = '') {
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.dataset.type = 'education';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">Education</span>
            <button type="button" class="btn-remove" title="Remove Entry">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-s"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>
        <div class="form-row">
            <div class="form-group col-6">
                <label>Degree / Field of Study</label>
                <input type="text" class="input-degree" placeholder="B.S. in Computer Science" value="${degree}">
            </div>
            <div class="form-group col-6">
                <label>College / School Name</label>
                <input type="text" class="input-college" placeholder="Stanford University" value="${college}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group col-6">
                <label>Graduation Year</label>
                <input type="text" class="input-year" placeholder="2024" value="${year}">
            </div>
            <div class="form-group col-6">
                <label>CGPA / Grade</label>
                <input type="text" class="input-cgpa" placeholder="3.8 / 4.0" value="${cgpa}">
            </div>
        </div>
    `;
    educationList.appendChild(item);
    updatePreview();
}

function addExperienceItem(company = '', position = '', duration = '', desc = '') {
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.dataset.type = 'experience';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">Experience</span>
            <button type="button" class="btn-remove" title="Remove Entry">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-s"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>
        <div class="form-row">
            <div class="form-group col-6">
                <label>Company Name</label>
                <input type="text" class="input-company" placeholder="Google" value="${company}">
            </div>
            <div class="form-group col-6">
                <label>Position / Title</label>
                <input type="text" class="input-position" placeholder="Software Engineer Intern" value="${position}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group col-12">
                <label>Duration (e.g. Jun 2023 - Present)</label>
                <input type="text" class="input-duration" placeholder="Jun 2023 - Present" value="${duration}">
            </div>
        </div>
        <div class="form-group">
            <label>Job Description</label>
            <textarea class="input-description" rows="3" placeholder="Developed feature X, optimized database query Y...">${desc}</textarea>
        </div>
    `;
    experienceList.appendChild(item);
    updatePreview();
}

function addProjectItem(projname = '', projtech = '', projlink = '', projdesc = '') {
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.dataset.type = 'project';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">Project</span>
            <button type="button" class="btn-remove" title="Remove Entry">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-s"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>
        <div class="form-row">
            <div class="form-group col-6">
                <label>Project Name</label>
                <input type="text" class="input-projname" placeholder="E-Commerce Website" value="${projname}">
            </div>
            <div class="form-group col-6">
                <label>Tech Stack</label>
                <input type="text" class="input-projtech" placeholder="React, Node.js, MongoDB" value="${projtech}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group col-12">
                <label>GitHub / Demo Link</label>
                <input type="url" class="input-projlink" placeholder="github.com/username/project" value="${projlink}">
            </div>
        </div>
        <div class="form-group">
            <label>Project Description</label>
            <textarea class="input-projdesc" rows="3" placeholder="Explain the key achievements and features of the project...">${projdesc}</textarea>
        </div>
    `;
    projectsList.appendChild(item);
    updatePreview();
}

// Handle removal of dynamic items
function handleRemoveItem(e) {
    const removeBtn = e.target.closest('.btn-remove');
    if (removeBtn) {
        const item = removeBtn.closest('.dynamic-item');
        item.style.opacity = '0';
        item.style.transform = 'translateY(8px)';
        setTimeout(() => {
            item.remove();
            updatePreview();
        }, 200);
    }
}

// ----------------------------------------------------
// PHOTO UPLOAD PROCESSING
// ----------------------------------------------------
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        alert('Unsupported file type. Please upload a PNG or JPG/JPEG image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        profilePhotoBase64 = evt.target.result;
        
        // Update form uploader visual
        uploadPreviewImg.src = profilePhotoBase64;
        uploadPreviewImg.classList.remove('hidden');
        uploadPreviewBox.querySelector('.placeholder-svg').classList.add('hidden');
        fileInfoLabel.textContent = file.name;
        btnRemovePhoto.classList.remove('hidden');
        
        // Update resume preview sheet visual
        resumePhotoImg.src = profilePhotoBase64;
        resumePhotoImg.classList.remove('hidden');
        resumeAvatarLetter.classList.add('hidden');
        
        updatePreview();
    };
    reader.readAsDataURL(file);
}

function handleRemovePhoto() {
    inputPhoto.value = '';
    profilePhotoBase64 = '';
    
    // Reset form uploader visual
    uploadPreviewImg.src = '';
    uploadPreviewImg.classList.add('hidden');
    uploadPreviewBox.querySelector('.placeholder-svg').classList.remove('hidden');
    fileInfoLabel.textContent = 'Supports PNG, JPG, JPEG';
    btnRemovePhoto.classList.add('hidden');
    
    // Reset resume preview sheet visual
    resumePhotoImg.src = '';
    resumePhotoImg.classList.add('hidden');
    resumeAvatarLetter.classList.remove('hidden');
    
    updatePreview();
}

// ----------------------------------------------------
// SKILLS TAGS MANAGEMENT
// ----------------------------------------------------
function addSkill(skill) {
    const cleaned = skill.trim();
    if (!cleaned) return;
    
    if (skillsList.includes(cleaned)) {
        inputSkill.value = '';
        return;
    }

    skillsList.push(cleaned);
    inputSkill.value = '';
    renderSkills();
    updatePreview();
}

function removeSkill(skill) {
    skillsList = skillsList.filter(s => s !== skill);
    renderSkills();
    updatePreview();
}

function renderSkills() {
    // Form Skills Container
    formSkillsContainer.innerHTML = '';
    skillsList.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'badge badge-skill';
        span.innerHTML = `
            ${skill}
            <button type="button" data-skill="${skill}" aria-label="Remove Skill">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
        formSkillsContainer.appendChild(span);
    });

    // Resume Preview Skills Container
    previewSkillsContainer.innerHTML = '';
    skillsList.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'badge-preview-skill';
        span.textContent = skill;
        previewSkillsContainer.appendChild(span);
    });

    if (skillsList.length === 0) {
        previewSkillsSection.classList.add('hidden');
    } else {
        previewSkillsSection.classList.remove('hidden');
    }
}

// ----------------------------------------------------
// LIVE PREVIEW UPDATING LOGIC
// ----------------------------------------------------
function updatePreview() {
    // Update Personal Information
    const fullname = inputFullname.value.trim();
    pFullname.textContent = fullname || 'John Doe';
    pSummary.textContent = inputSummary.value.trim();
    
    if (!inputSummary.value.trim()) {
        previewSummarySection.classList.add('hidden');
    } else {
        previewSummarySection.classList.remove('hidden');
    }
    
    // Set Avatar Initials
    resumeAvatarLetter.textContent = getInitials(fullname);

    // Contacts section items visibility sync
    const emailVal = inputEmail.value.trim();
    const phoneVal = inputPhone.value.trim();
    const locVal = inputLocation.value.trim();
    const linkedinVal = inputLinkedin.value.trim();
    const githubVal = inputGithub.value.trim();

    syncContactField('email', emailVal);
    syncContactField('phone', phoneVal);
    syncContactField('location', locVal);
    syncContactField('linkedin', linkedinVal);
    syncContactField('github', githubVal);

    if (!emailVal && !phoneVal && !locVal && !linkedinVal && !githubVal) {
        pContactSection.classList.add('hidden');
    } else {
        pContactSection.classList.remove('hidden');
    }

    // Update Education
    const eduItems = educationList.querySelectorAll('.dynamic-item');
    previewEducationList.innerHTML = '';
    if (eduItems.length === 0) {
        previewEducationSection.classList.add('hidden');
    } else {
        previewEducationSection.classList.remove('hidden');
        eduItems.forEach(item => {
            const degree = item.querySelector('.input-degree').value.trim();
            const college = item.querySelector('.input-college').value.trim();
            const year = item.querySelector('.input-year').value.trim();
            const cgpa = item.querySelector('.input-cgpa').value.trim();

            if (degree || college || year || cgpa) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <div class="preview-item-header">
                        <span class="preview-item-title">${degree || 'Degree'}</span>
                        <span class="preview-item-right">${year || ''}</span>
                    </div>
                    <div class="preview-item-header">
                        <span class="preview-item-subtitle">${college || 'College'}</span>
                        <span class="preview-item-right">${cgpa ? `GPA: ${cgpa}` : ''}</span>
                    </div>
                `;
                previewEducationList.appendChild(div);
            }
        });
        if (previewEducationList.children.length === 0) {
            previewEducationSection.classList.add('hidden');
        }
    }

    // Update Experience
    const expItems = experienceList.querySelectorAll('.dynamic-item');
    previewExperienceList.innerHTML = '';
    if (expItems.length === 0) {
        previewExperienceSection.classList.add('hidden');
    } else {
        previewExperienceSection.classList.remove('hidden');
        expItems.forEach(item => {
            const company = item.querySelector('.input-company').value.trim();
            const position = item.querySelector('.input-position').value.trim();
            const duration = item.querySelector('.input-duration').value.trim();
            const desc = item.querySelector('.input-description').value.trim();

            if (company || position || duration || desc) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <div class="preview-item-header">
                        <span class="preview-item-title">${position || 'Position'}</span>
                        <span class="preview-item-right">${duration || ''}</span>
                    </div>
                    <div class="preview-item-subtitle" style="margin-bottom: 4px;">${company || 'Company'}</div>
                    ${desc ? `<p class="preview-item-desc">${desc}</p>` : ''}
                `;
                previewExperienceList.appendChild(div);
            }
        });
        if (previewExperienceList.children.length === 0) {
            previewExperienceSection.classList.add('hidden');
        }
    }

    // Update Projects
    const projItems = projectsList.querySelectorAll('.dynamic-item');
    previewProjectsList.innerHTML = '';
    if (projItems.length === 0) {
        previewProjectsSection.classList.add('hidden');
    } else {
        previewProjectsSection.classList.remove('hidden');
        projItems.forEach(item => {
            const name = item.querySelector('.input-projname').value.trim();
            const tech = item.querySelector('.input-projtech').value.trim();
            const link = item.querySelector('.input-projlink').value.trim();
            const desc = item.querySelector('.input-projdesc').value.trim();

            if (name || tech || link || desc) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <div class="preview-item-header">
                        <span class="preview-item-title">${name || 'Project Name'} ${tech ? `<span style="font-weight: 500; font-size: 0.75rem; color: var(--text-muted);">(${tech})</span>` : ''}</span>
                        ${link ? `<span class="preview-item-right" style="font-size: 0.7rem; color: #4f46e5; word-break: break-all;">${link}</span>` : ''}
                    </div>
                    ${desc ? `<p class="preview-item-desc">${desc}</p>` : ''}
                `;
                previewProjectsList.appendChild(div);
            }
        });
        if (previewProjectsList.children.length === 0) {
            previewProjectsSection.classList.add('hidden');
        }
    }
    
    // Scale adjustment check
    adjustPreviewScale();
}

function syncContactField(field, value) {
    const item = document.getElementById(`p-contact-${field}-item`);
    const span = document.getElementById(`p-contact-${field}`);
    if (value) {
        span.textContent = value;
        item.classList.remove('hidden');
    } else {
        item.classList.add('hidden');
    }
}

// ----------------------------------------------------
// AUTOFILL & CLEAN HANDLERS
// ----------------------------------------------------
function fillSampleResume() {
    // Fill Personal Info
    inputFullname.value = 'Vivek Mishra';
    inputEmail.value = 'vivek@digitalheroesco.com';
    inputPhone.value = '+91 9876543210';
    inputLocation = document.getElementById('input-location'); // re-grab in case
    inputLocation.value = 'Noida, India';
    inputLinkedin.value = 'linkedin.com/in/vivekmishra';
    inputGithub.value = 'github.com/vivekmishra';
    inputSummary.value = 'Highly motivated and results-driven Frontend Developer and UI Designer with 3+ years of experience designing and implementing highly performant React and Javascript applications. Passionate about pixel-perfect visual design, custom UI components, animations, and clean architectures. Proven track record of optimizing page speeds and delivering modular web applications.';

    // Clear dynamic inputs first
    educationList.innerHTML = '';
    experienceList.innerHTML = '';
    projectsList.innerHTML = '';

    // Add Education
    addEducationItem(
        'B.Tech in Computer Science & Engineering',
        'Amity University',
        '2022',
        '8.8 / 10.0'
    );
    addEducationItem(
        'Higher Secondary Certificate (HSC)',
        'DAV Public School',
        '2018',
        '9.0 / 10.0'
    );

    // Add Experience
    addExperienceItem(
        'Digital Heroes',
        'Software Engineer',
        '2023 - Present',
        '• Led frontend development of multiple high-profile corporate web applications using Vanilla JS, React, and CSS3.\n• Optimized layout painting operations and script assets, resulting in a 40% reduction in first-contentful-paint (FCP) times.\n• Authored modular styles and micro-animations, boosting user engagement and satisfaction ratings by 25%.\n• Designed complex workflows and managed continuous integration pipelines for serverless architectures.'
    );
    addExperienceItem(
        'Tech Solutionists',
        'Junior Web Developer',
        '2022 - 2023',
        '• Engineered clean, responsive corporate websites, increasing cross-browser compatibility to 99.9%.\n• Built custom components, dialog patterns, and floating panels using CSS grid and flexbox, removing heavy libraries.\n• Assisted design team in drafting aesthetic guidelines, shadows systems, and dark/light color schemes.'
    );

    // Add Projects
    addProjectItem(
        'DevPortfolio',
        'React, Vite, CSS Grid',
        'github.com/vivekmishra/portfolio',
        '• Created a modern production-quality developer portfolio site featuring smooth scrolling, spring animations, and automatic theme synchronization.\n• Built search engine optimization tags, schema markup, and accessible aria-attributes for full accessibility.'
    );
    addProjectItem(
        'TaskFlow Pro',
        'Node.js, Express, MongoDB',
        'github.com/vivekmishra/taskflow',
        '• Developed a RESTful Task Management backend supporting multi-member workspaces and real-time state synchronization via Sockets.\n• Structured security features including JSON Web Tokens (JWT), express rate limiters, and environment config sanitization.'
    );

    // Add Skills
    skillsList = ['Java', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'React', 'SQL', 'CSS3', 'HTML5', 'Git'];
    renderSkills();

    // Trigger Photo reset (using initials avatar)
    handleRemovePhoto();

    // Remove any error state borders
    inputFullname.classList.remove('error');
    inputEmail.classList.remove('error');

    updatePreview();
}

function clearForm() {
    if (confirm('Are you sure you want to clear the entire form? This action cannot be undone.')) {
        inputFullname.value = '';
        inputEmail.value = '';
        inputPhone.value = '';
        const inputLoc = document.getElementById('input-location');
        if (inputLoc) inputLoc.value = '';
        inputLinkedin.value = '';
        inputGithub.value = '';
        inputSummary.value = '';
        
        handleRemovePhoto();
        
        educationList.innerHTML = '';
        experienceList.innerHTML = '';
        projectsList.innerHTML = '';
        
        skillsList = [];
        renderSkills();

        // Remove error styles
        inputFullname.classList.remove('error');
        inputEmail.classList.remove('error');

        updatePreview();
    }
}

// ----------------------------------------------------
// PDF GENERATION & VALIDATION
// ----------------------------------------------------
function validateForm() {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate Name
    if (!inputFullname.value.trim()) {
        inputFullname.classList.add('error');
        isValid = false;
    } else {
        inputFullname.classList.remove('error');
    }

    // Validate Email
    const emailVal = inputEmail.value.trim();
    if (!emailVal || !emailRegex.test(emailVal)) {
        inputEmail.classList.add('error');
        isValid = false;
    } else {
        inputEmail.classList.remove('error');
    }

    if (!isValid) {
        // Find the first error element and scroll to it
        const firstError = editorPanel.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

function downloadPDF() {
    if (!validateForm()) {
        alert('Please fill out the required fields (Name and Email) before exporting the PDF.');
        return;
    }

    const originalText = btnDownload.innerHTML;
    btnDownload.innerHTML = `
        <svg class="icon animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating PDF...
    `;
    btnDownload.disabled = true;

    // Temporarily reset CSS transform scaling on the resume sheet for capturing pixel perfect A4
    const originalTransform = resumeSheet.style.transform;
    const wrapper = document.querySelector('.preview-wrapper');
    const originalWrapperHeight = wrapper.style.height;

    resumeSheet.style.transform = 'none';
    wrapper.style.height = 'auto';

    // Wait for a brief moment to let browser layout engine settle
    setTimeout(() => {
        const opt = {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        };

        html2canvas(resumeSheet, opt).then(canvas => {
            // Restore scaling styling immediately
            resumeSheet.style.transform = originalTransform;
            wrapper.style.height = originalWrapperHeight;

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            const filename = `${inputFullname.value.trim().replace(/\s+/g, '_')}_Resume.pdf`;
            pdf.save(filename);

            // Restore button
            btnDownload.innerHTML = originalText;
            btnDownload.disabled = false;
        }).catch(err => {
            console.error('PDF Capture Error:', err);
            alert('Failed to generate PDF. Please try again.');
            
            // Restore styles
            resumeSheet.style.transform = originalTransform;
            wrapper.style.height = originalWrapperHeight;
            
            // Restore button
            btnDownload.innerHTML = originalText;
            btnDownload.disabled = false;
        });
    }, 150);
}
