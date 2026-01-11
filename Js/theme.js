function setTheme(mode = 'auto') {
    const userMode = localStorage.getItem('bs-theme');
    const sysMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    const useSystem = mode === 'system' || (!userMode && mode === 'auto');
    const modeChosen = useSystem ? 'system' : mode === 'dark' || mode === 'light' ? mode : userMode;

    if (useSystem) {
        localStorage.removeItem('bs-theme');
    } else {
        localStorage.setItem('bs-theme', modeChosen);
    }

    const theme = useSystem ? (sysMode ? 'light' : 'dark') : modeChosen;
    
    // Crea un elemento div per l'overlay della transizione
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#FFFEEF';
    overlay.style.opacity = '0';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);

    // Anima l'overlay
    let opacity = 0;
    const animation = setInterval(() => {
        opacity += 0.1;
        overlay.style.opacity = opacity;
        
        if (opacity >= 1) {
            clearInterval(animation);
            
            // Applica il tema
            document.documentElement.setAttribute('data-bs-theme', theme);
            
            // Imposta i colori personalizzati
            if (theme === 'dark') {
                // Tema scuro
                document.documentElement.style.setProperty('--bs-body-bg', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-body-color', '#ffffff');
                document.documentElement.style.setProperty('--bs-tertiary-bg', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-secondary-bg', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-primary-bg-subtle', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-border-color', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-card-bg', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-dropdown-bg', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-dropdown-border-color', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-dropdown-link-hover-bg', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-navbar-color', '#ffffff');
                document.documentElement.style.setProperty('--bs-dark', '#0a0a0a');
                document.documentElement.style.setProperty('--bs-dark-rgb', '10, 10, 10');
            } else {
                // Tema chiaro
                document.documentElement.style.setProperty('--bs-body-bg', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-body-color', '#000000');
                document.documentElement.style.setProperty('--bs-tertiary-bg', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-secondary-bg', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-primary-bg-subtle', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-border-color', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-card-bg', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-dropdown-bg', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-dropdown-border-color', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-dropdown-link-hover-bg', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-navbar-color', '#000000');
                document.documentElement.style.setProperty('--bs-light', '#FFFEEF');
                document.documentElement.style.setProperty('--bs-light-rgb', '255, 254, 239');
            }

            // Anima l'uscita dell'overlay
            setTimeout(() => {
                const fadeOut = setInterval(() => {
                    opacity -= 0.1;
                    overlay.style.opacity = opacity;
                    
                    if (opacity <= 0) {
                        clearInterval(fadeOut);
                        overlay.remove();
                    }
                }, 20);
            }, 100);
        }
    }, 20);

    document.querySelectorAll('.mode-switch .btn').forEach(e => e.classList.remove('active'));
    document.getElementById(modeChosen).classList.add('active');
}

setTheme();
document.querySelectorAll('.mode-switch .btn').forEach(e => e.addEventListener('click', () => setTheme(e.id)));
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => setTheme());