class Localization {
    static languageData = {};
    static currentLanguageCode = 'en';  // Default language

    // Load language file
    static async loadLanguage(languageCode) {
        try {
            console.log("language: " + `assets/locales/${languageCode}.json`);
            const response = await fetch(`assets/locales/${languageCode}.json`);
            if (!response.ok) {
                throw new Error(`Could not load ${languageCode}.json`);
            }
            this.languageData = await response.json();
            console.log(JSON.stringify(this.languageData, null, 2));  // Log the loaded data
            this.currentLanguageCode = languageCode;  // Update current language
            //console.log("languageCode: " + this.currentLanguageCode);
            this.updateUI();
        } catch (error) {
            console.error("Error loading language:", error);
        }
    }

    // Get the translated text for a key
    static get(key) {
        return this.languageData[key] || key;  // Default to the key if translation not found
    }

    // Update the UI text elements
    static updateUI() {
        const elements = document.querySelectorAll('[data-localize]');
        elements.forEach((element) => {
            const key = element.getAttribute('data-localize');
            console.log("key: " + key);
            element.textContent = this.get(key);  // Set the element's text to the translated value
            console.log("element.textContent: " + element.textContent);
        });

        // Handle right-to-left languages (e.g., Arabic)
        // In updateUI() function
        console.log("languageCode: " + this.currentLanguageCode);
        const isRtlLanguage = ['ar'].includes(this.currentLanguageCode);
        console.log("isRtlLanguage: " + isRtlLanguage);
        document.body.style.direction = isRtlLanguage ? 'rtl' : 'ltr';
    }
}

// Initialize language to English on page load
window.onload = () => {
    Localization.loadLanguage('en');
};

// Change language based on the selection
function changeLanguage(languageCode) {
    Localization.loadLanguage(languageCode).then(() => {
        // Dispatch a custom event to notify the Phaser game about the language change
        const languageChangedEvent = new Event('languageChanged');
        document.dispatchEvent(languageChangedEvent);
    });
}
