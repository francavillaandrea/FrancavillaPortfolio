document.addEventListener('DOMContentLoaded', function() {
    // Imposta lo scroll smooth per tutto il documento
    document.documentElement.style.scrollBehavior = 'smooth';

    document.querySelectorAll('a[href^="./"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === window.location.pathname) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });

    document.querySelector('.navbar-brand').addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const progressBar = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.width = scrolled + '%';
        if (scrolled > 0) {
            progressBar.style.display = 'block';
        } else {
            progressBar.style.display = 'none';
        }
    });
});