let vSymbols = ["🐱", "🐶", "♣️", "♠️", "♦️", "❤️"];
let turnedCards = [];
let blockClick;
let foundCouples = 0;
let totalCouples = vSymbols.length;

$('#btnStart').click(avviaGioco);
$('#btnMostraTutte').click(function () {
    $('.carta').each(function () {
        $(this).text($(this).attr("data-symbol")).fadeIn(200);
    });
});
$('#btnNascondiTutte').click(function () {
    $('.carta').slideUp(500, function () {
        $(this).text("?").slideDown(200);
    });
});

function avviaGioco() {
    $('#gioco').empty(); // Rimuovo carte 
    turnedCards = []; // Reset carte girate
    blockClick = false; // Reset blocco
    foundCouples = 0; // Reset coppie trovate
    $('#messaggio').text("Trova tutte le coppie!").css('color', 'green');

    // Creazione del mazzo di carte 
    let mazzo = vSymbols.concat(vSymbols);
    // Mischio mazzo 
    mazzo.sort(() => Math.random() - 0.5);
    //console.log("mischio ", mazzo);

    // Aggiungo carte nel contenitore
    $.each(mazzo, function (i, simbolo) {
        let carta = $("<div>").addClass("carta").text("?").attr("data-symbol", simbolo);
        $('#gioco').append(carta);
    });
}

$('#gioco').on("click", ".carta", function () {
    if (blockClick)
        return;
    if ($(this).text() != "?")
        return;

    $(this).text($(this).attr("data-symbol"));

    turnedCards.push($(this));

    if (turnedCards.length == 2) {
        blockClick = true; // Blocco i click
        let [c1, c2] = turnedCards;

        if (c1.attr("data-symbol") == c2.attr("data-symbol")) {
            // Coppia trovata!
            foundCouples++;
            c1.css("background-color", "green").animate({ opacity: 0.5 }, 300);
            c2.css("background-color", "green").animate({ opacity: 0.5 }, 300);
            $('#messaggio').text(`Coppia trovata! (${foundCouples}/${totalCouples})`).css('color', 'green');

            turnedCards = [];
            blockClick = false;

            // Controllo vittoria
            if (foundCouples == totalCouples) {
                $('#messaggio').text("HAI VINTO!").css('color', 'gold').css('font-size', '24px');
                blockClick = true; // Blocco ulteriori click
            }
        }
        else {
            // Coppia non trovata - rigirio le carte
            $('#messaggio').text("Sbagliato! Riprova!").css('color', 'red');
            c1.css("background-color", "red").animate(300);
            c2.css("background-color", "red").animate(300);

            setTimeout(function () {
                c1.text("?").css("background-color", "lightgray");
                c2.text("?").css("background-color", "lightgray");
                turnedCards = [];
                blockClick = false;
            }, 800);
        }
    }

});
$('#btnStart').trigger("click");