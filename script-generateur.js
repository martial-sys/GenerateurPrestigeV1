// =================================================================
// SCRIPT DU GÉNÉRATEUR PRESTIGE V10.0 - Version Finale de Lancement
// Version avec validation "Prestige", finitions UX et modale améliorée.
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
	
	    // [ARCHITECTE] DÉBUT DE L'AJOUT : SYSTÈME DE SÉCURITÉ ET VALIDATION D'URL
    const ACCESS_CODE = 'CAPITAL2025';
    
    function setupSecurity() {
        const overlay = document.getElementById('security-overlay');
        const input = document.getElementById('access-code-input');
        const btn = document.getElementById('access-code-btn');
        const errorMsg = document.getElementById('security-error');

        if (localStorage.getItem('generator_access_granted') === 'true') {
            overlay.classList.add('hidden');
            return;
        }
        
        const checkCode = () => {
            if (input.value === ACCESS_CODE) {
                localStorage.setItem('generator_access_granted', 'true');
                overlay.classList.add('hidden');
            } else {
                errorMsg.textContent = 'Code d\'accès incorrect.';
                input.value = '';
            }
        };

        btn.addEventListener('click', checkCode);
        input.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') checkCode();
        });
    }

    function isValidUrl(string) {
        if (!string || string.trim() === '') return true; // Un champ vide est valide
        try {
            new URL(string);
            return string.trim().startsWith('http');
        } catch (_) {
            return false;  
        }
    }
    // [ARCHITECTE] FIN DE L'AJOUT
    

    // =================================================================
    // SECTION DE L'ARCHITECTE : MOTEUR DU GÉNÉRATEUR
    // =================================================================

    function debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // --- 0. ÉTAT CENTRAL (STATE) ---
    const portfolioData = {
        skills: [],
        projects: [],
        testimonials: []
    };
    
    // [ARCHITECTE V10.0] Drapeau pour suivre les modifications du formulaire
    let formulaireModifie = false;

    // --- 1. SÉLECTION DES ÉLÉMENTS CLÉS DU DOM ---
    const iframePreview = document.querySelector('#preview-panel iframe');
    const accordionItems = document.querySelectorAll('.accordion-item');
    const mobileToggleButton = document.getElementById('mobile-toggle');
    const formInputs = document.querySelectorAll('#control-panel input, #control-panel textarea');
    const socialPicker = document.querySelector('.social-picker');
    const socialInputsContainer = document.querySelector('.social-inputs-container');
    const addSkillButton = document.getElementById('add-skill');
    const skillsRepeater = document.getElementById('skills-repeater');
    const addProjectButton = document.getElementById('add-project');
    const projectsRepeater = document.getElementById('projects-repeater');
    const addTestimonialButton = document.getElementById('add-testimonial');
    const testimonialsRepeater = document.getElementById('testimonials-repeater');
    const themePicker = document.querySelector('.theme-picker');
    const downloadButton = document.getElementById('download-btn');
    const successModal = document.getElementById('success-modal');
    const closeModalButton = document.getElementById('close-modal-btn');
    
    // --- 2. FONCTIONS PRINCIPALES ---

    async function injecterTemplateDansIframe() {
        if (!iframePreview) { console.error("Erreur Critique : L'iframe d'aperçu est introuvable."); return; }
        try {
            const response = await fetch('template-moule.html');
            if (!response.ok) { throw new Error(`Erreur de chargement: ${response.statusText}`); }
            const htmlContent = await response.text();
            iframePreview.srcdoc = htmlContent;
            console.log("Injection du Template réussie.");
        } catch (error) {
            console.error("Échec du chargement du moule de template:", error);
            iframePreview.srcdoc = `<p style="font-family: sans-serif; text-align: center; padding: 2rem;">Erreur : Impossible de charger le fichier template-moule.html.</p>`;
        }
    }

    function envoyerDonneesALiframe() {
        const envoyer = () => {
            if (iframePreview && iframePreview.contentWindow) {
                iframePreview.contentWindow.postMessage({ type: 'FULL_UPDATE', payload: portfolioData }, '*');
            }
        };
        if (iframePreview.contentDocument.readyState === 'complete') {
            envoyer();
        } else {
            iframePreview.addEventListener('load', envoyer, { once: true });
        }
    }

    const debouncedEnvoyerDonnees = debounce(envoyerDonneesALiframe);
    
    // [ARCHITECTE V10.1] Version finale et corrigée de la fonction de validation
function validerFormulaire() {
    let estValide = true;
    
    const afficherErreur = (id, message) => {
        const input = document.getElementById(id);
        if (!input) return;
        const formGroup = input.closest('.form-group') || input.closest('.repeater-container')?.parentElement;
        if (!formGroup) return;
        const errorMessageElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.add('has-error');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
        estValide = false;
    };

    const effacerErreurs = () => {
        document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    };
    
    effacerErreurs();

    const champsTexteRequis = {
        'nomComplet': "Le nom complet est obligatoire.",
        'titre': "Le titre/poste est obligatoire.",
        'logo': "L'URL du logo est obligatoire.",
        'photoProfil': "L'URL de la photo de profil est obligatoire.",
        'aboutP': "La description 'À Propos' est obligatoire."
    };

    for (const id in champsTexteRequis) {
        const input = document.getElementById(id);
        if (!input || input.value.trim() === '') {
            afficherErreur(id, champsTexteRequis[id]);
        }
    }

    // [ARCHITECTE - CORRECTION] Utilisation de la fonction isValidUrl pour une validation plus robuste.
    const champsUrl = ['logo', 'photoProfil', 'ogImage', 'facebook', 'instagram', 'linkedin', 'tiktok'];
    champsUrl.forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value.trim() !== '' && !isValidUrl(input.value.trim())) {
            afficherErreur(id, "L'URL doit être valide et commencer par http:// ou https://");
        }
    });
    
    const whatsappInput = document.getElementById('whatsapp');
    const emailInput = document.getElementById('email');
    if (whatsappInput.value.trim() === '' && emailInput.value.trim() === '') {
        // [ARCHITECTE - CORRECTION] Affiche l'erreur sur les DEUX champs pour une meilleure UX.
        afficherErreur('email', "Vous devez renseigner au moins un contact (WhatsApp ou Email).");
        afficherErreur('whatsapp', "Vous devez renseigner au moins un contact (WhatsApp ou Email).");
    }
    if (emailInput.value.trim() !== '' && !emailInput.value.includes('@')) {
        afficherErreur('email', "L'adresse email semble invalide.");
    }
    
    // [ARCHITECTE - CORRECTION] Ajout du nettoyage des messages d'erreur quand la condition est remplie.
    if (portfolioData.skills.length === 0) {
        document.getElementById('skills-error').textContent = "Vous devez ajouter au moins une catégorie de compétence.";
        estValide = false;
    } else {
        document.getElementById('skills-error').textContent = "";
    }
    if (portfolioData.projects.length === 0) {
        document.getElementById('projects-error').textContent = "Vous devez ajouter au moins un projet.";
        estValide = false;
    } else {
        document.getElementById('projects-error').textContent = "";
    }

    return estValide;
}


    // [ARCHITECTE V10.0] Fonctions de mise à jour modifiées pour intégrer le drapeau de modification
    function mettreAJourEtValider(instantane = false) {
        formulaireModifie = true;
        const estValide = validerFormulaire();
        downloadButton.disabled = !estValide;
        if (instantane) {
            envoyerDonneesALiframe();
        } else {
            debouncedEnvoyerDonnees();
        }
    }
    
    function setupAccordion() {
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                if (!item.classList.contains('active')) {
                    accordionItems.forEach(otherItem => otherItem.classList.remove('active'));
                }
                item.classList.toggle('active');
            });
        });
    }

    function setupMobileToggle() {
        if (!mobileToggleButton) return;
        const mobileToggleButtonText = mobileToggleButton.querySelector('span');
        const mobileToggleButtonIcon = mobileToggleButton.querySelector('i');
        mobileToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('mobile-preview-active');
            const isPreviewActive = document.body.classList.contains('mobile-preview-active');
            mobileToggleButtonText.textContent = isPreviewActive ? 'Éditer' : 'Aperçu';
            mobileToggleButtonIcon.className = isPreviewActive ? 'fas fa-pen' : 'fas fa-eye';
        });
    }
    
    function setupDataBinding() {
        formInputs.forEach(input => {
            if (!input.closest('.repeater-container')) {
                 portfolioData[input.id] = input.value;
                 input.addEventListener('input', (event) => {
                    portfolioData[event.target.id] = event.target.value;
                    mettreAJourEtValider();
                });
            }
        });
    }

    function setupSkillsLogic() {
        addSkillButton.addEventListener('click', () => {
            portfolioData.skills.push({ id: `skill_${Date.now()}`, title: '', items: ['', '', ''] });
            renderSkills();
            mettreAJourEtValider(true);
        });
        skillsRepeater.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-supprimer-competence')) {
                portfolioData.skills = portfolioData.skills.filter(skill => skill.id !== event.target.dataset.id);
                renderSkills();
                mettreAJourEtValider(true);
            }
        });
        skillsRepeater.addEventListener('input', (event) => {
            const { id, field } = event.target.dataset;
            const skill = portfolioData.skills.find(s => s.id === id);
            if (skill) {
                if (field.startsWith('item-')) {
                    skill.items[parseInt(field.split('-')[1])] = event.target.value;
                } else {
                    skill[field] = event.target.value;
                }
                mettreAJourEtValider();
            }
        });
    }

    function renderSkills() {
        skillsRepeater.innerHTML = '';
        portfolioData.skills.forEach(skill => {
            const el = document.createElement('div');
            el.className = 'repeater-item';
            el.innerHTML = `
                <button class="remove-btn btn-supprimer-competence" data-id="${skill.id}" type="button" aria-label="Supprimer">&times;</button>
                <div class="form-group"><label>Titre de la catégorie</label><input type="text" data-id="${skill.id}" data-field="title" value="${skill.title}" placeholder="Ex: Langues"></div>
                <div class="form-group"><label>Compétence 1</label><input type="text" data-id="${skill.id}" data-field="item-0" value="${skill.items[0]}" placeholder="Ex: Français"></div>
                <div class="form-group"><label>Compétence 2</label><input type="text" data-id="${skill.id}" data-field="item-1" value="${skill.items[1]}" placeholder="Ex: Anglais"></div>
                <div class="form-group"><label>Compétence 3</label><input type="text" data-id="${skill.id}" data-field="item-2" value="${skill.items[2]}" placeholder="Ex: Espagnol"></div>`;
            skillsRepeater.appendChild(el);
        });
    }

    function setupProjectsLogic() {
    addProjectButton.addEventListener('click', () => {
        portfolioData.projects.push({ id: `project_${Date.now()}`, title: '', description: '', image: '', link: '' });
        renderProjects();
        mettreAJourEtValider(true);
    });
    projectsRepeater.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-supprimer-projet')) {
            portfolioData.projects = portfolioData.projects.filter(p => p.id !== event.target.dataset.id);
            renderProjects();
            mettreAJourEtValider(true);
        }
    });
    // [ARCHITECTE - CORRECTION] La logique de validation est maintenant appliquée EN TEMPS RÉEL.
    projectsRepeater.addEventListener('input', (event) => {
        const { id, field } = event.target.dataset;
        const project = portfolioData.projects.find(p => p.id === id);
        if (project) {
            const value = event.target.value;
            // Si le champ est un lien ou une image, on valide l'URL avant de mettre à jour les données de l'aperçu.
            if (field === 'link' || field === 'image') {
                project[field] = isValidUrl(value) ? value : '';
            } else {
                project[field] = value;
            }
            mettreAJourEtValider();
        }
    });
}


    function renderProjects() {
        projectsRepeater.innerHTML = '';
        portfolioData.projects.forEach(project => {
            const el = document.createElement('div');
            el.className = 'repeater-item';
            el.innerHTML = `
                <button class="remove-btn btn-supprimer-projet" data-id="${project.id}" type="button" aria-label="Supprimer">&times;</button>
                <div class="form-group"><label>Titre du projet</label><input type="text" data-id="${project.id}" data-field="title" value="${project.title}" placeholder="Ex: Refonte du site..."></div>
                <div class="form-group"><label>Description</label><textarea data-id="${project.id}" data-field="description" rows="3" placeholder="Description courte...">${project.description}</textarea></div>
                <div class="form-group"><label>URL de l'image</label><input type="url" data-id="${project.id}" data-field="image" value="${project.image}" placeholder="https://..."></div>
                <div class="form-group"><label>Lien du projet</label><input type="url" data-id="${project.id}" data-field="link" value="${project.link}" placeholder="https://..."></div>`;
            projectsRepeater.appendChild(el);
        });
    }

    function setupTestimonialsLogic() {
        addTestimonialButton.addEventListener('click', () => {
            portfolioData.testimonials.push({ id: `testimonial_${Date.now()}`, text: '', authorName: '', authorTitle: '', authorPhoto: '' });
            renderTestimonials();
            mettreAJourEtValider(true);
        });
        testimonialsRepeater.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-supprimer-temoignage')) {
                portfolioData.testimonials = portfolioData.testimonials.filter(t => t.id !== event.target.dataset.id);
                renderTestimonials();
                mettreAJourEtValider(true);
            }
        });
        testimonialsRepeater.addEventListener('input', (event) => {
            const { id, field } = event.target.dataset;
            const testimonial = portfolioData.testimonials.find(t => t.id === id);
            if (testimonial) {
                testimonial[field] = event.target.value;
                mettreAJourEtValider();
            }
        });
    }

    function renderTestimonials() {
        testimonialsRepeater.innerHTML = '';
        portfolioData.testimonials.forEach(testimonial => {
            const el = document.createElement('div');
            el.className = 'repeater-item';
            el.innerHTML = `
                <button class="remove-btn btn-supprimer-temoignage" data-id="${testimonial.id}" type="button" aria-label="Supprimer">&times;</button>
                <div class="form-group"><label>Texte du témoignage</label><textarea data-id="${testimonial.id}" data-field="text" rows="4" placeholder="Texte...">${testimonial.text}</textarea></div>
                <div class="form-group"><label>Nom de l'auteur</label><input type="text" data-id="${testimonial.id}" data-field="authorName" value="${testimonial.authorName}" placeholder="Ex: Mariam A."></div>
                <div class="form-group"><label>Poste de l'auteur</label><input type="text" data-id="${testimonial.id}" data-field="authorTitle" value="${testimonial.authorTitle}" placeholder="Ex: Gérante..."></div>
                <div class="form-group"><label>URL de la photo</label><input type="url" data-id="${testimonial.id}" data-field="authorPhoto" value="${testimonial.authorPhoto}" placeholder="https://..."></div>`;
            testimonialsRepeater.appendChild(el);
        });
    }
    
    function setupSocialMediaLogic() {
    socialPicker.addEventListener('click', (event) => {
        const button = event.target.closest('.social-btn');
        if (!button) return;
        const socialName = button.dataset.social;
        const wrapper = document.getElementById(`wrapper-${socialName}`);
        const input = document.getElementById(socialName);
        
        const isActive = button.classList.toggle('active');
        if (isActive) {
            wrapper.style.display = 'block';
            portfolioData[socialName] = isValidUrl(input.value) ? input.value : '';
        } else {
            wrapper.style.display = 'none';
            input.value = '';
            delete portfolioData[socialName];
        }
        mettreAJourEtValider(true);
    });
    // [ARCHITECTE - CORRECTION] La logique de validation est maintenant appliquée EN TEMPS RÉEL.
    socialInputsContainer.addEventListener('input', (event) => {
        const input = event.target;
        if (input.type === 'url' && portfolioData.hasOwnProperty(input.id)) {
            const value = input.value;
            portfolioData[input.id] = isValidUrl(value) ? value : '';
            mettreAJourEtValider();
        }
    });
}


    function setupThemePickerLogic() {
        themePicker.addEventListener('click', (event) => {
            const swatch = event.target.closest('.theme-swatch');
            if (!swatch) return;
            themePicker.querySelector('.active').classList.remove('active');
            swatch.classList.add('active');
            const themeName = swatch.dataset.theme;
            if (iframePreview && iframePreview.contentWindow) {
                iframePreview.contentWindow.postMessage({ type: 'UPDATE_THEME', payload: themeName }, '*');
            }
        });
    }
    
    // [ARCHITECTE V10.0] Logique de téléchargement mise à jour
    function setupDownloadLogic() {
        downloadButton.addEventListener('click', () => {
            if (!iframePreview || !iframePreview.contentWindow) { console.error("L'aperçu n'est pas disponible."); return; }
            formulaireModifie = false; // Le travail est "sauvegardé"
            const finalHtmlContent = iframePreview.contentWindow.document.documentElement.outerHTML;
            const blob = new Blob([finalHtmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'index.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            successModal.style.display = 'flex';
        });
        const closeModal = () => { successModal.style.display = 'none'; };
        closeModalButton.addEventListener('click', closeModal);
        successModal.addEventListener('click', (event) => { if (event.target === successModal) { closeModal(); } });
    }
    
    function injecterCSSModale() {
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay { display: none; position: fixed; z-index: 1001; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); justify-content: center; align-items: center; }
            .modal-content { background-color: var(--white); color: var(--gray-700); padding: var(--spacing-6); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg); text-align: center; max-width: 440px; width: 90%; position: relative; border-top: 4px solid var(--primary-color); animation: modal-appear 0.3s ease-out; }
            @keyframes modal-appear { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .close-modal { position: absolute; top: 12px; right: 16px; color: var(--gray-400); font-size: 28px; font-weight: bold; cursor: pointer; transition: color 0.2s; background: none; border: none; }
            .close-modal:hover, .close-modal:focus { color: var(--gray-700); }
            .modal-icon { font-size: 3rem; margin-bottom: 0.5rem; }
            .modal-content h2 { font-size: 1.5rem; color: var(--gray-900); margin-bottom: 0.75rem; }
            .modal-content p { margin-bottom: 1.5rem; line-height: 1.6; }
            .modal-content p strong { color: var(--primary-color); font-weight: 600; }
            .btn-primary-modal { background: var(--primary-color); color: var(--white); border: none; border-radius: var(--border-radius); padding: var(--spacing-3) var(--spacing-5); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: var(--spacing-2); }
            .btn-primary-modal:hover { background: var(--primary-dark); }
            .btn-primary-modal i { font-size: 0.9em; }
        `;
        document.head.appendChild(style);
    }
    
    // [ARCHITECTE V10.0] Ajout du filet de sécurité avant de quitter la page
    function setupConfirmationAvantDeQuitter() {
        window.addEventListener('beforeunload', (event) => {
            if (formulaireModifie) {
                event.preventDefault();
                event.returnValue = '';
            }
        });
    }

    async function init() {        
     setupSecurity(); // [ARCHITECTE] Appel de la fonction de sécurité
    
        console.log("Initialisation du Générateur Prestige (Version Finale de Lancement)...");
        injecterCSSModale();
        await injecterTemplateDansIframe();
        setupAccordion();
        setupMobileToggle();
        setupDataBinding(); 
        setupSkillsLogic();
        setupProjectsLogic();
        setupTestimonialsLogic();
        setupSocialMediaLogic();
        setupThemePickerLogic();
        setupDownloadLogic();
        setupConfirmationAvantDeQuitter(); // Activation du filet de sécurité
        validerFormulaire(); // Validation initiale
    }

    // Lancement du générateur
    init();

});
