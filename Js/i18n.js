import i18next from 'https://cdn.jsdelivr.net/npm/i18next@21.6.10/+esm'
import Backend from 'https://cdn.jsdelivr.net/npm/i18next-http-backend@1.3.0/+esm'
import LanguageDetector from 'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@6.1.3/+esm'

const i18nConfig = {
    fallbackLng: 'it',
    supportedLngs: ['it', 'en', 'fr', 'de'],
    backend: {
        loadPath: '../assets/locales/{{lng}}.json'
    },
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    i18next
        .use(Backend)
        .use(LanguageDetector)
        .init(i18nConfig)
        .then(() => {
            updateContent();
            setupLanguageSelector();
        });
});

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18next.t(key);
    });
}

function setupLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    languageSelect.value = i18next.language;
    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        i18next.changeLanguage(lang).then(() => {
            updateContent();
            document.documentElement.lang = lang;
        });
    });
}

i18next.on('languageChanged', updateContent);