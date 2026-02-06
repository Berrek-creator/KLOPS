
var microLevelDetectionIntervalID = null
const infoBox = document.getElementById('infobox')

// на каком уровне срабатываения микрофона начать запись
const micTrashold = 20

async function enableMicroCheck() {
    infoBox.classList.add("active");
    infoBox.classList.remove("disabled");
    infoBox.innerHTML = "Микрофон включен"
    try {
        // Request access and set up analyzer
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        audioContext.createMediaStreamSource(stream).connect(analyser);

        // Analyze input
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        microLevelDetectionIntervalID = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            console.log('Mic Level:', Math.round(average));

            if (average > micTrashold) {
                clearInterval(microLevelDetectionIntervalID);
                StartRecord()
            }
        }, 100);

    } catch (err) { console.error(err); }
}

function disableMicroCheck() {
    infoBox.classList.add("disabled");
    infoBox.classList.remove("enabled");
    infoBox.innerHTML = "Микрофон выключен"

    if (microLevelDetectionIntervalID) {
        clearInterval(microLevelDetectionIntervalID);
    }
    StopRecord()
}

document.getElementById('startButton').addEventListener('click', enableMicroCheck);
document.getElementById('stopButton').addEventListener('click', disableMicroCheck);


// Распознавание
const outBox = document.getElementById('resultBox')

var recognition = new SpeechRecognition();
var recognizing = false

function StopRecord() {
    recognition.continuous = false
    recognition.stop()
    console.log(recognition)
}

function StartRecord() {
    infoBox.innerHTML = "Идет запись"
    
    var final_transcript;
    
    //check if using chrome and up to date
    if ('webkitSpeechRecognition' in window) {
    //init
        if (!recognizing) {
            recognition.start()
        }
    
        recognition.continuous = true;
        recognition.interimResults = true;
    
        recognition.onstart = function() {
            console.log("START RECORD")
            recognizing = true;
        };

        //if there is error somewhere
        recognition.onerror = function(event) {
            console.log("error")
        };
        
        //after giving the spech
        recognition.onresult = function(event) {
            console.log("RESULT")
            var interim_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    // finilize and show the compleated text
                    final_transcript += event.results[i][0].transcript;
                } else {
                    // run the speech and output it 
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            final_transcript = final_transcript;
            outBox.innerHTML = final_transcript;
            // interim_span.innerHTML = interim_transcript;
        };

        var activity = []
        
        recognition.onspeechstart = event => {
            console.log("START")
            activity.push('Started:' + event.timeStamp)
        }
        
        recognition.onend = event => {
            recognizing = false
            console.log(activity)
            console.log("RECORDING STOP")
            StopRecord()
            enableMicroCheck()
        }
    }
}


