class Localization {
    static languageData = {};
    static currentLanguageCode = 'en';  // Default language

    // Load language file
    static async loadLanguage(languageCode) {
        try {
            const response = await fetch(`assets/locales/${languageCode}.json`); // Correct the path here
            if (!response.ok) {
                throw new Error(`Could not load ${languageCode}.json`);
            }
            this.languageData = await response.json();
            this.currentLanguageCode = languageCode;  // Update current language
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
            element.textContent = this.get(key);  // Set the element's text to the translated value
        });

        // Handle right-to-left languages (e.g., Arabic)
        const isRtlLanguage = ['ar'].includes(this.currentLanguageCode);
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
        // Assuming that the language data is loaded successfully, update the UI
        this.nextDayButton.setText(Localization.get('next_day')); // Use Localization.get() to get the translated text
        this.dayText.setText(Localization.get('days') + this.dayCounter);
    });
}

