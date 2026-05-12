/**
 * Pinterest_Clone - Application d'inspiration visuelle
 * @version 3.0.0
 */

// ========== CONSTANTES ==========
const APP_STORAGE_KEY = 'PINPRO_APP_DATA_V3';

// VOS IMAGES AVEC DESCRIPTIONS UNIQUES - CHEMINS CORRIGÉS
const REAL_IMAGES = [
    {
        src: './css/assets/photos/apres_1.webp', 
        title: 'Dypsis lutescens (Palmier Areca)',
        category: 'Plantes Tropicales',
        description: "Offert à Arsellia.T, c'est à dire moi pour symboliser ma croissance, ce Palmier Areca, emblème de Victoire et de triomphe, partage notre quotidien depuis 18 ans et s'épanouit au rythme de ma protection.",
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/apres_2.webp', 
        title: 'Dracaena fragrans (Dragonnier d\'Afrique)',
        category: 'Plantes Tropicales',
        description: "Symbole de résilience adaptative et d\'équilibre entre ombre et lumière",
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/apres_3.webp', 
        title: 'Ficus benjamina \'Variegata\'',
        category: 'Plantes Tropicales',
        description: "Offert à Edene.T pour symboliser sa croissance, ce Variegata, emblème de Le Luxe et le Raffinement, partage notre quotidien depuis 8 ans et s'épanouit au rythme de ma protection.",
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/Apres_4.webp', 
        title: 'Pachira aquatica (Châtaignier de la Guyane)',
        category: 'Plantes Tropicales',
        description: "Offert à Zou pour symboliser sa croissance, ce Pachira, emblème de chance et de richesse, partage notre quotidien depuis 3 ans et s'épanouit au rythme de sa protection.",
        author: 'Arsellia T.'
    },      
    {
        src: './css/assets/photos/Après_5.webp', 
        title: 'Yucca elephantipes (Yucca pied d\'éléphant)',
        category: 'Plantes Tropicales',
        description: 'Symbole de force tranquille et de protection, sa structure sculpturale incarne la ténacité et la résilience face aux épreuves.',
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/Apres_6.webp', 
        title: 'Euonymus fortunei \'Emerald \'n\' Gold\'',
        category: 'Plantes d\'Extérieur & Balcon',
        description: 'Symbole de rayonnement et de constance, son feuillage bicolore incarne la lumière persistante à travers les saisons.',
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/Apres_7.webp', 
        title: 'Nerium oleander (Laurier-rose)',
        category: 'Plantes d\'Extérieur & Balcon',
        description: 'Symbole de victoire et de beauté fatale, il incarne la persévérance et la force de caractère sous un soleil ardent.',
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/Apres_8.webp', 
        title: 'Bergenia cordifolia (Plante des savetiers)',
        category: 'Plantes d\'Extérieur & Balcon',
        description: 'Symbole de robustesse et d\'amitié inaltérable, elle incarne la fidélité capable de braver les hivers les plus rudes.',
        author: 'Arsellia T.'
    },
    {
        src: './css/assets/photos/Apres_9.webp', 
        title: 'Lonicera periclymenum (Chèvrefeuille)',
        category: 'Plantes d\'Extérieur & Balcon',
        description: 'Symbole de lient éternels et de dévouement, son parfum et ses lianes entrelacées incarnent l’attachement et la générosité du cœur.',
        author: 'Arsellia T.'
    }
];

// ========== APPLICATION ==========
const pinApp = (function() {
    'use strict';
    
    // État privé
    let allPins = [];
    let savedPinIds = new Set();
    let currentView = 'home';
    let currentFilter = '';
    let searchTimeout = null;
    
    // Éléments DOM
    let pinGrid, searchInput, modal, toast, modalSaveBtn, modalCloseBtn;
    
    // ========== STOCKAGE ==========
    function saveToLocalStorage() {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(Array.from(savedPinIds)));
        } catch (error) {
            console.error('Erreur localStorage:', error);
            showToast('⚠️ Erreur de sauvegarde', 3000);
        }
    }
    
    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(APP_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    savedPinIds = new Set(parsed);
                }
            }
        } catch (error) {
            console.error('Erreur chargement localStorage:', error);
            savedPinIds = new Set();
        }
    }
    
    // ========== GÉNÉRATION DES PINS ==========
    function generatePinsWithRealImages() {
        const pins = [];
        
        REAL_IMAGES.forEach((img, index) => {
            pins.push({
                id: index + 1,
                title: img.title,
                author: img.author,
                imageSrc: img.src,
                category: img.category,
                description: img.description,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        });
        
        return pins;
    }
    
    // ========== RENDU DES PINS ==========
    function getFilteredPins() {
        let result = [...allPins];
        
        if (currentView === 'saved') {
            result = result.filter(pin => savedPinIds.has(pin.id));
        }
        
        if (currentFilter && currentFilter.trim()) {
            const searchTerm = currentFilter.toLowerCase().trim();
            result = result.filter(pin => 
                pin.title.toLowerCase().includes(searchTerm) || 
                pin.category.toLowerCase().includes(searchTerm) ||
                pin.description.toLowerCase().includes(searchTerm)
            );
        }
        
        return result;
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    function createPinCard(pin) {
        const isSaved = savedPinIds.has(pin.id);
        
        const article = document.createElement('article');
        article.className = 'pin-card';
        
        article.innerHTML = `
            <div class="pin-image-container">
                <img src="${pin.imageSrc}" 
                     alt="${escapeHtml(pin.title)}" 
                     loading="lazy"
                     decoding="async"
                     onerror="this.src='./css/assets/photos/fallback.webp'">
                <div class="pin-overlay">
                    <button class="save-btn ${isSaved ? 'saved' : ''}" 
                            data-pin-id="${pin.id}"
                            data-action="save">
                        ${isSaved ? '✓ Enregistré' : 'Enregistrer'}
                    </button>
                </div>
            </div>
            <div class="pin-info">
                <h3 class="pin-title">${escapeHtml(pin.title)}</h3>
                <div class="pin-author">
                    <span class="author-avatar">${escapeHtml(pin.author.charAt(0))}</span>
                    <span class="author-name">${escapeHtml(pin.author)}</span>
                </div>
            </div>
        `;
        
        // Ouverture de la modale au clic sur l'image
        const imageContainer = article.querySelector('.pin-image-container');
        imageContainer.addEventListener('click', (e) => {
            if (!e.target.closest('[data-action="save"]')) {
                openModal(pin);
            }
        });
        
        // Gestionnaire pour le bouton d'enregistrement
        const saveBtn = article.querySelector('[data-action="save"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleSave(pin.id);
            });
        }
        
        return article;
    }
    
    function renderPins() {
        if (!pinGrid) return;
        
        pinGrid.innerHTML = '';
        const displayPins = getFilteredPins();
        
        if (displayPins.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.innerHTML = `
                <p><strong>${currentView === 'saved' ? '📥 Aucun pin enregistré' : '🔍 Aucun résultat'}</strong></p>
                <p>${currentView === 'saved' ? 'Explorez et enregistrez vos inspirations préférées !' : 'Essayez une autre recherche.'}</p>
            `;
            pinGrid.appendChild(emptyDiv);
            return;
        }
        
        const fragment = document.createDocumentFragment();
        displayPins.forEach(pin => {
            fragment.appendChild(createPinCard(pin));
        });
        pinGrid.appendChild(fragment);
    }
    
    function showToast(message, duration = 2000) {
        if (!toast) return;
        const messageSpan = toast.querySelector('.toast-message');
        if (messageSpan) {
            messageSpan.textContent = message;
        }
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    function updateSaveButton(pinId, isSaved) {
        // Mise à jour des boutons dans la grille
        const btns = document.querySelectorAll(`.save-btn[data-pin-id="${pinId}"]`);
        btns.forEach(btn => {
            btn.textContent = isSaved ? '✓ Enregistré' : 'Enregistrer';
            btn.classList.toggle('saved', isSaved);
        });
        
        // Mise à jour du bouton dans la modale
        if (modalSaveBtn && modalSaveBtn.dataset.pinId == pinId) {
            modalSaveBtn.textContent = isSaved ? '✓ Enregistré' : 'Enregistrer';
            modalSaveBtn.classList.toggle('saved', isSaved);
        }
    }
    
    function toggleSave(pinId) {
        const isSaved = !savedPinIds.has(pinId);
        
        if (isSaved) {
            savedPinIds.add(pinId);
            showToast('✅ Enregistré dans vos favoris !');
        } else {
            savedPinIds.delete(pinId);
            showToast('❌ Retiré des enregistrements');
        }
        
        saveToLocalStorage();
        updateSaveButton(pinId, isSaved);
        
        // Re-render seulement si on est dans la vue "saved"
        if (currentView === 'saved') {
            renderPins();
        }
    }
    
    function showView(view) {
        currentView = view;
        
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === view) {
                btn.classList.add('active');
            }
        });
        
        if (searchInput) {
            searchInput.value = '';
            currentFilter = '';
        }
        
        renderPins();
    }
    
    function openModal(pin) {
        if (!modal) return;
        
        const isSaved = savedPinIds.has(pin.id);
        
        // Remplir la modale avec les données du pin
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalAuthorName = document.getElementById('modalAuthorName');
        const modalAuthorAvatar = document.getElementById('modalAuthorAvatar');
        
        if (modalImage) modalImage.src = pin.imageSrc;
        if (modalTitle) modalTitle.textContent = pin.title;
        if (modalDescription) modalDescription.textContent = pin.description;
        if (modalAuthorName) modalAuthorName.textContent = pin.author;
        if (modalAuthorAvatar) modalAuthorAvatar.textContent = pin.author.charAt(0);
        
        if (modalSaveBtn) {
            modalSaveBtn.textContent = isSaved ? '✓ Enregistré' : 'Enregistrer';
            modalSaveBtn.classList.toggle('saved', isSaved);
            modalSaveBtn.dataset.pinId = pin.id;
            
            // Remplacer l'ancien écouteur
            const newSaveBtn = modalSaveBtn.cloneNode(true);
            modalSaveBtn.parentNode.replaceChild(newSaveBtn, modalSaveBtn);
            modalSaveBtn = newSaveBtn;
            modalSaveBtn.addEventListener('click', () => toggleSave(pin.id));
        }
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    function init() {
        pinGrid = document.getElementById('pinGrid');
        searchInput = document.getElementById('searchInput');
        modal = document.getElementById('pinModal');
        toast = document.getElementById('toast');
        modalSaveBtn = document.getElementById('modalSaveBtn');
        modalCloseBtn = document.querySelector('.modal-close-btn');
        
        if (!pinGrid) {
            console.error('Élément pinGrid non trouvé');
            return;
        }
        
        // Générer les pins
        allPins = generatePinsWithRealImages();
        loadFromLocalStorage();
        
        console.log(`✅ ${allPins.length} inspirations chargées avec descriptions uniques`);
        
        // Recherche avec debounce
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (searchTimeout) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentFilter = e.target.value;
                    renderPins();
                }, 300);
            });
        }
        
        // Fermeture de la modale
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeModal);
        }
        
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
            
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modal.classList.contains('show')) {
                    closeModal();
                }
            });
        }
        
        // Configurer les boutons de navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const view = btn.getAttribute('data-view');
            if (view) {
                btn.addEventListener('click', () => showView(view));
            }
        });
        
        renderPins();
        console.log('✅ PinPro initialisé - Effet Pinterest actif');
    }
    
    return {
        init,
        showView,
        closeModal,
        toggleSave
    };
})();

window.pinApp = pinApp;
