var inputStasjonEl = document.getElementById("inputStasjon")
var velgenEl = document.getElementById("velgen")
var velgEnArr = [];
var searchTimeout;
var a = 0;

// Når en bokstav er skrevet inn i søkefeltet
inputStasjonEl.onkeydown = function () {
    velgEnArr = [];
    velgenEl.textContent = "";
    // Element mens den laster inn
    if (!loadingelement) {
        var loadingelement = document.createElement("p");
        loadingelement.className = "loadingtextindex";
        loadingelement.textContent = "Laster inn...";
        velgenEl.appendChild(loadingelement);
    }
    // Delay så den ikke sender inn autocomplete API requests hele tiden
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(søkenstasjon, 200);
}
function søkenstasjon () {
    var stasjonInputel = document.getElementById("inputStasjon");
    // Får alle stasjonene i norge fra Entur API
    fetch(`https://api.entur.io/geocoder/v1/autocomplete?text=${stasjonInputel.value}`, {
            headers: {
                "ET-Client-Name": "alsta-bussen",
            },
        })
        .then(response => response.json())
        .then(data => {
            velgEnArr = [];
            velgenEl.textContent = "";
            a = 0;
            // For lengden av stasjoner
            for (x = 0; x < data.features.length; x++) {
                if (data.features[x].properties.id.includes("NSR:StopPlace")) {
                    a++
                    // lage ny p element og knappen med class og id og alt
                    var stasjonspelement = document.createElement('p');
                    var stasjonsbutton = document.createElement('button');
                    stasjonspelement.className = "stasjonspelement";
                    stasjonsbutton.className = "stasjonsbutton";
                    stasjonsbutton.setAttribute("id", `${a}`)
                    stasjonspelement.setAttribute("id", `${a}`)
                    stasjonsbutton.setAttribute("onclick", "buttonclicked(this.id)")
                    stasjonspelement.setAttribute("onclick", "buttonclicked(this.id)")
                    stasjonspelement.textContent = data.features[x].properties.name + ", " + data.features[x].properties.locality;
                    var velgEnArrel = data.features[x].properties.id;
                    stasjonsbutton.textContent = "Velg";
                    stasjonspelement.appendChild(stasjonsbutton);
                    velgenEl.appendChild(stasjonspelement)
                    velgEnArr.push(velgEnArrel);
                }
            }
            // skjekk lasting eller ingen resultater
            if (velgEnArr.length === 0) {
                var nodataelement = document.createElement("p");
                nodataelement.className = "loadingtextindex";
                if (inputStasjonEl.value.length == 0) {
                    nodataelement.textContent = "";
                } else {
                    nodataelement.textContent = "Ingen resultater.";
                };
                velgenEl.appendChild(nodataelement);
            }
        })
        .catch(error => {
            // hvis error
            console.error("Error fetching data:", error);
        });
    }
    // Når knappen er klikket lagre til localstorage og send til andre side
function buttonclicked(clicked_id) {
    localStorage.setItem("ID", velgEnArr[clicked_id - 1])
    window.location.replace("avganger.html");
};