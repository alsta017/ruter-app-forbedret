let avgangerEl = document.getElementById("avganger");
let avg = 0;
let textel = document.getElementById("text");
let originaltidEl = document.getElementById("originaltid");
let quaydisruptionsel = document.getElementById("quaydisruptions");
var StopPlaceID = localStorage.getItem("ID");
// Starte koden når siden starter
updateBodyContent();
// Oppdatere tidene hver 30 sekunder
setInterval(updateBodyContent, 5000);


// Koden for å oppdatere siden
function updateBodyContent() {
    avg = 1;
    fetch('https://api.entur.io/journey-planner/v3/graphql', {
    method: 'POST',
    headers: {
    // Replace this with your own client name:
    'ET-Client-Name': 'alsta-bussen',
    'Content-Type': 'application/json'
    },
    // GraphQL Query
    // timeRange: 1999999999
    body: JSON.stringify({ 
        query: `{
            stopPlace(id: "${StopPlaceID}") {
                situations {
                    affects {
                        ... on AffectedStopPlace {
                            __typename
                            stopPlace {
                                name
                            }
                        }
                    }
                    summary {
                        value
                    }
                    description {
                        value
                    }
                }
                name
                estimatedCalls(
                    numberOfDepartures: 50
                    includeCancelledTrips: true
                    arrivalDeparture: departures
                ) {
                    quay {
                        publicCode
                    }
                    realtime
                    realtimeState
                    expectedDepartureTime
                    aimedDepartureTime
                    cancellation
                    predictionInaccurate
                    occupancyStatus
                    destinationDisplay {
                        frontText
                        via
                    }
                    situations {
                        affects {
                            ... on AffectedLine {
                                __typename
                                line {
                                    publicCode
                                }
                            }
                            ... on AffectedStopPlace {
                                __typename
                                stopPlace {
                                    name
                                }
                            }
                            ... on AffectedServiceJourney {
                                operatingDay
                                serviceJourney {
                                    publicCode
                                }
                            }
                            ... on AffectedStopPlaceOnLine {
                                __typename
                                stopPlace {
                                    name
                                }
                            }
                            ... on AffectedStopPlaceOnServiceJourney {
                                operatingDay
                                stopPlace {
                                    name
                                }
                            }
                        }
                        priority
                        summary {
                            value
                        }
                        description {
                            value
                        }
                        severity
                        serviceJourneys {
                            line {
                                publicCode
                            }
                        }
                    }
                    quay {
                        name
                        situations {
                            summary {
                                value
                            }
                            description {
                                value
                            }
                        }
                    }
                    serviceJourney {
                        operator {
                            id
                        }
                        line {
                            publicCode
                            transportMode
                        }
                        journeyPattern {
                            quays {
                                name
                            }
                        }
                    }
                }
            }
        }`
    }),
    })
    .then(res => res.json())
    .then(stopPlaceData => {
        let html = '';
        avgangerEl.innerHTML = "";
        const estimatedCalls = stopPlaceData.data.stopPlace.estimatedCalls;
        console.log(stopPlaceData)

        // Avvik som gjelder for hele siden
        const noticeElementQuay = document.createElement('div');
        noticeElementQuay.className = 'noticesquay';
        const situationsquay = stopPlaceData.data.stopPlace;
        const situationsquaylength = stopPlaceData.data.stopPlace.situations;
        // Skjekker hvor mange avviker det er og printer hvis det er, hvis ikke skip
        for (let g = 0; g < situationsquaylength.length; g++) {
            const situationDescriptionQuay = situationsquay.situations[g].summary[0].value;
            const situationDescriptionQuay2 = situationsquay.situations[g].description[0].value;
            const noticepelementquay = document.createElement('h1');
            const noticepelement2quay = document.createElement('p');
            const affectsDivquay = document.createElement('div');
            const affectsDiv2quay = document.createElement('div');
            const affectsImgquay = document.createElement('img');
            // Her Trygve img
            affectsDivquay.className = 'affectsDivQuay';
            affectsDiv2quay.className = 'affectsDiv2Quay';
            affectsImgquay.className = 'affectsImgQuay';
            affectsImgquay.alt = 'ruter_exclamation.svg';
            affectsImgquay.src = 'bilder/ruter_exclamation.svg';
            noticepelement2quay.className = 'affectspDiv2Quay';
            noticepelementquay.className = 'affectspDivQuay';
            noticepelement2quay.textContent = situationDescriptionQuay2;
            noticepelementquay.textContent = situationDescriptionQuay;
            noticepelementquay.appendChild(affectsImgquay);
            noticeElementQuay.appendChild(noticepelementquay);
            noticeElementQuay.appendChild(noticepelement2quay);
            }

        // For alle avanger length
        for (let i = 0; i < estimatedCalls.length; i++) {
            // Definerer alle variabler, siden vi må hente informasjonen
            // Spesifiserer at det er denne EstimatedCall
            const estimatedCall = estimatedCalls[i];
            const currentTime = new Date();
            const expectedTimeMin = new Date(estimatedCall.expectedDepartureTime);
            const expectedMinutes = Math.floor((expectedTimeMin- currentTime) / 60000);
            const expectedTimeString = `${expectedMinutes} min`;
            const aimedTime = new Date(estimatedCall.aimedDepartureTime).toLocaleTimeString('no-NO', {hour: '2-digit', minute: '2-digit'});
            const expectedTime = new Date(estimatedCall.expectedDepartureTime).toLocaleTimeString('no-NO', {hour: '2-digit', minute: '2-digit'});
            const destination = estimatedCall.destinationDisplay.frontText;
            const line = estimatedCall.serviceJourney.line.publicCode;
            const isTimeReal = estimatedCall.realtime;
            const isTimeRealstate = estimatedCall.realtimeState;
            const departureCancelled = estimatedCall.cancellation;
            const situations = estimatedCall.situations;
            const erdetruter = estimatedCall.serviceJourney.operator.id;
            const predict = estimatedCall.predictionInaccurate;
            
            // Ny div å printe en og en avgang til (Skal bruke senere når man kan trykke for å se hvor bussen er)
            const avgangene = document.createElement('div');
            avgangene.className = 'avgang';
            avgangene.setAttribute('id', `avgang${avg}`);
            
            // Full div for linjenummer og displaytekst
            const lineFull = document.createElement('div');
            lineFull.className = 'linefull';
            
            // Div for linjenummer
            const lines = document.createElement('div');
            lines.className = 'line';
            lines.textContent = line;

            // Definere alle fargene for Ruter-linjene
            if (erdetruter.includes("RUT")) {
                if (line > 0 && line < 10 && line.length < 2) {
                    lines.className = lines.classList + ' orange';
                } else if (line > 9 && line < 20) {
                    lines.className = lines.classList + ' blue';
                } else if (line.length > 1 && line.replace(/\D/g,'') > 19 && line.replace(/\D/g,'') < 99 || line == "1B" || line == "2B" || line == "2E" || line == "3B" || line == "4B" || line == "5B" || line == "100" || line == "110" || line == "130" || line == "130N" || line == "140" || line == "140N" || line == "145" || line == "300" || line == "300E" || line == "11B" || line == "13B" || line == "17B"){
                    lines.className = lines.classList + ' red';
                } else if (line.length > 1 && line.replace(/\D/g,'') > 99 && line.replace(/\D/g,'') < 4000) {
                    lines.className = lines.classList + ' green';
                } else {
                    lines.className = lines.classList + ' other';
                };
            } else {
                lines.className = lines.classList + ' other';
            };
            
            // Div for Tekst ved siden av linjenummer (Display)
            const destinationDiv = document.createElement('div');
            destinationDiv.className = 'destination';
            destinationDiv.textContent = destination;
            
            // Div rundt hele tiden (Det til høyre)
            const allTime = document.createElement('div');
            allTime.className = 'alltime';
            
            // Div og span for "exptected" og "delayed". Delayed er den røde teksten som kommer ved siden av bare når den er forsinket, så må definere i js
            const expectedElement = document.createElement('div');
            const delayElement = document.createElement('span');
            delayElement.style.color = "red";
            delayElement.style.fontSize = "75%";
            delayElement.style.margin = "0px 8px 0px 4px";
            const howMuchDelayeddate = new Date(estimatedCall.expectedDepartureTime).toLocaleTimeString('no-NO', {hour: '2-digit', minute:'2-digit'});
            delayElement.innerText = `(${howMuchDelayeddate})`;
            expectedElement.className = 'expected';
            expectedElement.textContent = expectedTimeString;
            
            // Definerer hva som står i de forskjellige minuttene
            if (expectedElement.textContent === "-1 min") {
                expectedElement.textContent = "Kjørte nå";
            } else if (expectedElement.textContent === "0 min") {
                expectedElement.textContent = "Nå";
            } else if (expectedElement.textContent === "1 min") {
                expectedElement.textContent = "1 min";
            };
            // Her Trygve img

            // Lager div til rød/grønn sirkel ved siden av minuttene
            const realTimeDisplayDiv = document.createElement('div');
            const realTimeDisplay = document.createElement('img');
            realTimeDisplayDiv.appendChild(realTimeDisplay);

            // WIP
            const redTextNode = document.createTextNode("Avganstider er basert på tabel");
            const greenTextNode = document.createTextNode("Avganstider er live oppdatert");

            

            // Definerer "aimed", klokkeslettet som vises som manuelt til venstre for minuttene
            const aimedElement = document.createElement('div');
            if(expectedTime === aimedTime) {
                aimedElement.className = 'aimed';
                aimedElement.textContent = aimedTime;
            } else {
                aimedElement.className = 'aimeddelayed';
                aimedElement.textContent = aimedTime;
            };

            // Definerer om prikken ved siden av minuttene skal være Rød eller grønn basert på predict og isTimeReal
            if (predict) {
                realTimeDisplayDiv.textNode = redTextNode;
                realTimeDisplay.className = 'realtimedisplayred';
                realTimeDisplay.src = 'bilder/Basic_red_dot.png';
                realTimeDisplay.alt = 'Real time';
            } else if (isTimeReal) {
                realTimeDisplayDiv.textNode = greenTextNode;
                realTimeDisplay.className = 'realtimedisplay';
                realTimeDisplay.src = 'bilder/Basic_green_dot.png';
                realTimeDisplay.alt = 'Real time';
            } else {
                realTimeDisplayDiv.textNode = greenTextNode;
                realTimeDisplay.className = 'realtimedisplayred';
                realTimeDisplay.src = 'bilder/Basic_red_dot.png';
                realTimeDisplay.alt = 'Real time';
                expectedElement.textContent = "ca. " + expectedElement.textContent;
            };
            

            // Definerer om det er et avvik på linjen, og hvis det er så printer den under linjen
            const noticeElement = document.createElement('div');
            noticeElement.className = 'notices';
            for (let i = 0; i < situations.length; i++) {
                const situationDescription = situations[i].summary[0].value;
                const situationDescription2 = situations[i].description[0].value;
                // Skjekker om avvik har noe value, hvis ikke skip
                if (situationDescription) {
                    const noticepelement = document.createElement('h1');
                    
                    const affectsDiv = document.createElement('div');
                    
                    const affectsImg = document.createElement('img');
                    // Her Trygve img
		            // SetinEl(displaydrittEl) om det skjer her nede da...
                    affectsDiv.className = 'affectsDiv';
                    affectsImg.className = 'affectsImg';
                    noticepelement.className = 'affectspDiv';
                    affectsImg.alt = 'ruter_exclamation.svg';
                    affectsImg.src = 'bilder/ruter_exclamation.svg';
                    noticepelement.textContent = situationDescription;
                    noticepelement.appendChild(affectsImg);
                    noticeElement.appendChild(noticepelement);
                    if (situationDescription2) {
                        const noticepelement2 = document.createElement('p');
                        noticepelement2.className = 'affectspDiv2';
                        noticepelement2.textContent = situationDescription2;
                        const affectsDiv2 = document.createElement('div');
                        affectsDiv2.className = 'affectsDiv2';
                        noticeElement.appendChild(noticepelement2);
                    }
                };
            };


            // WIP  -  W O R K  I N  P R O G R E S S  - 

            // const noticepelement3 = document.createElement('p');
            // noticepelement3.className = 'affectspDiv3'
            // const noticepelement4 = document.createElement('p');
            // noticepelement4.className = 'affectspDiv4'
            // for (let i = 0; i < estimatedCall.situations.length; i++) {
            //     for (let z = 0; z < estimatedCall.situations[i].affects.length; z++) {
            //         if (estimatedCall.situations[i].affects[z].stopPlace) {
            //             if (noticepelement3.textContent !== estimatedCall.situations[i].affects[z].stopPlace + ", ") {
            //                 noticepelement3.textContent = noticepelement3.textContent + estimatedCall.situations[i].affects[z].stopPlace.name + ", ";
            //             }
            //         } else if (estimatedCall.situations[i].affects[z].line) {
            //             if (estimatedCall.situations[i].affects[z].line + ", ") {
            //                 noticepelement4.textContent = noticepelement4.textContent + estimatedCall.situations[i].affects[z].line.publicCode + ", ";
            //             }
                        
            //         }
            //     } 
            // }
            // noticepelement3.textContent = "Gjelder for stoppene: " + noticepelement3.textContent;
            // if (noticepelement3.textContent !== "Gjelder for stoppene: ") {
            //     noticepelement3.textContent = noticepelement3.textContent.slice(0, -2); // Remove the last character
            //     noticeElement.appendChild(noticepelement3);
            // }
            // noticepelement4.textContent = "Gjelder for linjene: " + noticepelement4.textContent;
            
            // if (noticepelement4.textContent !== "Gjelder for linjene: ") {
            //     noticepelement4.textContent = noticepelement4.textContent.slice(0, -2); // Remove the last character
            //     noticeElement.appendChild(noticepelement4);
            // }
            

            // const passengersElement = document.createElement('p');
            // const passengersDiv = document.createElement('div');
            // passengersDiv.className = "passengers";
            // if (occupancy !== "noData") {
            //     if(occupancy == "manySeatsAvailable") {
            //         passengersElement.textContent = "Mange ledige seter";
            //     } else if(occupancy == "fewSeatsAvailable") {
            //         passengersElement.textContent = "Få ledige seter";
            //     } else if(occupancy == "standingRoomOnly") {
            //         passengersElement.textContent = "Bare ståplasser";
            //     } else if(occupancy == "full") {
            //         passengersElement.textContent = "Nesten helt full";
            //     } else if(occupancy == "notAcceptingPassengers") {
            //         passengersElement.textContent = "Helt full";
            //     };
            //     passengersDiv.appendChild(passengersElement);
            // };

            // Lager en div for alt untatt avviksmeldingen
            const fulldiv = document.createElement('div');
            fulldiv.className = 'fullalldiv';
            var cancelledDiv = document.createElement('div');
            cancelledDiv.className = "cancelledTextDiv";
            // Skjekker om avgang er kansellert, og hvis det er adde en class som stryker ut avgangen
            if(departureCancelled) {
                if (isTimeRealstate == "canceled") {
                    cancelledDiv.textContent = " (Cancelled)"
                    lines.className = lines.classList + ' destcancel';
                    destinationDiv.className = destinationDiv.classList + ' destcancel dest2';
                    aimedElement.className = aimedElement.classList + ' destcancel';
                    expectedElement.className = expectedElement.classList + ' destcancelexp';

                } else {
                    lines.className = lines.classList + ' destcancel';
                    destinationDiv.className = destinationDiv.classList + ' destcancel dest2';
                    aimedElement.className = aimedElement.classList + ' destcancel';
                    expectedElement.className = expectedElement.classList + ' destcancelexp';
                    cancelledDiv.textContent = " (Cancelled (No real time, so not guaranteed))"
                    realTimeDisplayDiv.textNode = greenTextNode;
                    realTimeDisplay.className = 'realtimedisplayred';
                    realTimeDisplay.src = 'bilder/Basic_red_dot.png';
                    realTimeDisplay.alt = 'Real time';
                    expectedElement.textContent = expectedElement.textContent;
                };
            };

            // Sier fra om hvile stasjoner avviket gjelder for
            // WIP  -  W O R K  I N  P R O G R E S S  -
            var stationElement = document.createElement('p');
            stationElement.className = "allStationList";
            for (t = 0; t < estimatedCall.serviceJourney.journeyPattern.quays.length; t++) {
                stationElement.textContent += estimatedCall.serviceJourney.journeyPattern.quays[t].name + ", ";
            }
            
            // Putter alt til HTML
            var destinationDivFull = document.createElement('div');
            destinationDivFull.className = "destinationDivFull";
            destinationDivFull.appendChild(destinationDiv);
            destinationDivFull.appendChild(cancelledDiv);
            lineFull.appendChild(lines);
            lineFull.appendChild(destinationDivFull);

            fulldiv.appendChild(lineFull);

            allTime.appendChild(aimedElement);

            // Hvis forsinket, putt delayElement (Rød tekst)
            if (howMuchDelayeddate !== aimedTime) {
                allTime.appendChild(delayElement);
            };
            
            // Putter enda mer til HTML
            allTime.appendChild(expectedElement);
            allTime.appendChild(realTimeDisplay);

            fulldiv.appendChild(allTime);

            avgangene.appendChild(fulldiv);
            avgangene.appendChild(noticeElement);
            
            avgangerEl.appendChild(avgangene);
            
            avg++;
    };
    textel.innerHTML = `Avganger fra: ${stopPlaceData.data.stopPlace.name}`;
    originaltidEl.innerHTML = "Ruter/Entur API (Testing)";
});
};

function goback() {
    window.location.replace("index.html");
}
