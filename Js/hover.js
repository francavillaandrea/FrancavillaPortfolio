document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.getElementById('hobbyDropdown');
    const dropdownMenu = new bootstrap.Dropdown(dropdown.querySelector('.dropdown-toggle'));

    dropdown.addEventListener('mouseenter', function() {
        dropdownMenu.show();
    });

    dropdown.addEventListener('mouseleave', function() {
        dropdownMenu.hide();
    });

    dropdown.querySelector('.dropdown-toggle').addEventListener('click', function(e) {
        if (this.getAttribute('aria-expanded') === 'true') {
            window.location.href = './hobby.html';
        }
    });
});