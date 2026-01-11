let canSend = true; // Variabile per gestire il timer

function sendEmail(event) {
    event.preventDefault();

    if (!canSend) {
        alert("Devi attendere 5 minuti prima di inviare un altro messaggio.");
        return;
    }

    const form = document.getElementById('contactForm');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    // Validazione dei campi
    if (name.length < 3 || subject.length < 3 || message.length < 3) {
        alert("Tutti i campi devono contenere almeno 3 caratteri.");
        return;
    }

    // Validazione dell'email
    if (!email.includes("@")) {
        alert("L'email deve contenere il simbolo '@'.");
        return;
    }

    const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message
    };

    emailjs
        .send("service_nh9mom1", "template_tjb3g7p", templateParams)
        .then(() => {
            alert("Email inviata con successo!");
            form.reset();
            canSend = false; // Disabilita l'invio

            // Timer di 5 minuti
            setTimeout(() => {
                canSend = true;
            }, 300000); // 300000 ms = 5 minuti
        })
        .catch((error) => {
            console.error("Errore nell'invio dell'email:", error);
            alert("Errore nell'invio dell'email. Riprova più tardi.");
        });
}