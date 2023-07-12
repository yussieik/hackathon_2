

// API data
const url = 'https://wordsapiv1.p.rapidapi.com/words/?random=true';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '78444f0874msh4eb076286998f03p1b8d51jsn14555402f74e',
		'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
	}
};

// starting variables
let CORRECT_COUNT = 0;
let STREAK = 0;
let WRONG_STREAK = 0;
let WRONG_COUNT = 0;
let DIFFICULTY = 7;
let POINTS = 0;

const LEVELS = {
    "8": "Super Easy",
    "7": "Easy",
    "6": "Medium",
    "5": "Tough",
    "4": "Hard",
    "3": "Expert",
    "2": "Insane",
    "1": "Word Master"
}

const images = {
    "en": "url('https://www.alleganyco.gov/wp-content/uploads/American-Flag-51-1024x681.jpg')",
    "he": "url('https://img.freepik.com/free-photo/flag-israel_1401-139.jpg?size=626&ext=jpg&ga=GA1.1.1348202671.1659703817&semt=ais')",
    "ru": "url('https://www.advantour.com/russia/images/symbolics/russia-flag_sm.jpg')",
    "fr": "url('https://www.flagsonline.it/uploads/2016-6-6/420-272/france.jpg')",
    "ar": "url('https://img.freepik.com/free-photo/flag-united-arab-emirates_1401-251.jpg?size=626&ext=jpg&ga=GA1.2.1348202671.1659703817&semt=ais')",
};




// get word and translation
const getWord = async (difficulty) => {
    try {
        document.querySelector("#userGuess").focus()

      const response = await fetch(`${url}&frequencyMax=${difficulty}&frequencyMin=${difficulty - 1}`, options);
      const data = await response.json();
      let output = {
        word: data.word,
      };
      const qlang = document.querySelector('.qactive').name;
      const alang = document.querySelector('.aactive').name;
      await getQTranslation(output.word, qlang);
      
    } catch (error) {
      console.error(error);
    }
};
  
const getQTranslation = async (word, qlang) => {
    if (qlang === 'en') {
        const wordP = document.querySelector("#qword")
        wordP.textContent = word;
    } else {
        try {
        const AZURE_KEY1 = "6a0b89f71fbf4e869904acada652218e";
        const AZURE_KEY2 = "7d5fc92fa7cc404aa5b3235b7d2e059f";
        const AZURE_REGION = "eastus";
        const ENDPOINT_URL = "https://api.cognitive.microsofttranslator.com/translate";
    
        const headers = {
            'Ocp-Apim-Subscription-Key': AZURE_KEY1,
            'Ocp-Apim-Subscription-Region': AZURE_REGION,
            'Content-Type': 'application/json',
        };
        const source_lang = 'en';
        const target_lang = qlang;
    
        const params = {
            'api-version': '3.0',
            'from': source_lang,
            'to': target_lang,
        };
    
        const payload = [
            {
            'Text': word,
            },
        ];
    
        const qResponse = await fetch(`${ENDPOINT_URL}?${new URLSearchParams(params)}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });
    
        const qData = await qResponse.json();
        const qTranslation = qData[0]['translations'][0]['text'];
        const wordP = document.querySelector("#qword");
        wordP.textContent = qTranslation;
        } catch (error) {
        console.error(error);
        }
    };
};

// select question language by clicking buttons
let qbuttons = document.querySelectorAll(".qlanguage-button");

qbuttons.forEach(qbutton => {
    qbutton.addEventListener("click", () => selectqlanguage(qbutton));
});
let selectqlanguage = (qbutton) => {
    // add qactive to chosen language class list
    qbutton.classList.add("qactive")
    for (i of qbuttons) {
        if (qbutton !== i) {
            i.classList.remove("qactive")
        };
    };

    // change background to relevant flag    

    document.querySelector(".question-container").style.backgroundImage = images[qbutton.name];


    // display word of that language
    getWord(DIFFICULTY);
};


// select answer language by clicking buttons
let abuttons = document.querySelectorAll(".alanguage-button");

abuttons.forEach(abutton => {
    abutton.addEventListener("click", () => selectalanguage(abutton));
});

let selectalanguage = (abutton) => {
    abutton.classList.add("aactive")
    for (i of abuttons) {
        if (abutton !== i) {
            i.classList.remove("aactive")
        };
    };
    

    document.querySelector(".answer-container").style.backgroundImage = images[abutton.name];
};

// handle when user submits  
const handleGuess = async (e) => {
    e.preventDefault();
    // get question word
    const qWord = document.querySelector("#qword").textContent;

    // translate qWord into guess language (alang)
    try {
    const AZURE_KEY1 = "6a0b89f71fbf4e869904acada652218e";
    const AZURE_KEY2 = "7d5fc92fa7cc404aa5b3235b7d2e059f";
    const AZURE_REGION = "eastus";
    const ENDPOINT_URL = "https://api.cognitive.microsofttranslator.com/translate";

    const headers = {
        'Ocp-Apim-Subscription-Key': AZURE_KEY1,
        'Ocp-Apim-Subscription-Region': AZURE_REGION,
        'Content-Type': 'application/json',
    };

    const qlang = document.querySelector('.qactive').name;
    const alang = document.querySelector('.aactive').name;
    
    const params = {
        'api-version': '3.0',
        'from': qlang,
        'to': alang,
    };

    const payload = [
        {
        'Text': qWord,
        },
    ];

    const aResponse = await fetch(`${ENDPOINT_URL}?${new URLSearchParams(params)}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
    });

    const aData = await aResponse.json();
    const aTranslation = aData[0]['translations'][0]['text'];
    document.querySelector("#userGuess").focus()
    // get user answer
    const userGuess = document.querySelector("#userGuess").value;
    
    // compare
    // if correct
    if (userGuess.toLowerCase() === aTranslation.toLowerCase()) {
        
        // streak
        CORRECT_COUNT ++;
        WRONG_STREAK = 0;
        STREAK ++;
        POINTS += 10;
        if (STREAK % 5 === 0 && STREAK > 0) {
            DIFFICULTY --;
            POINTS += 30;
            document.querySelector("#level").textContent = `Level: ${LEVELS[DIFFICULTY]}`
        };

        // visual changes
        document.querySelector("#correction").textContent = "Excellent! +10 points!";
        document.querySelector("#userGuess").value=''
        document.querySelector("#points").textContent = `Points: ${POINTS}`
        document.querySelector("#correct-count").textContent = `Correct: ${CORRECT_COUNT}/${CORRECT_COUNT+WRONG_COUNT} (${Math.round(CORRECT_COUNT/(CORRECT_COUNT+WRONG_COUNT)*100)}%)`
        document.querySelector("#streak").textContent = `Streak: ${STREAK}`;
        document.querySelector("#correction").setAttribute("style", "display: block");
        createWord(qWord, aTranslation, userGuess, qlang, alang, true, DIFFICULTY)

        setTimeout(() => {
            document.querySelector("#correction").setAttribute("style", "display: none");
        }, 1000);

        getWord(DIFFICULTY);

        // if incorrect
    } else {
        WRONG_COUNT ++;
        STREAK = 0;
        WRONG_STREAK ++;
        POINTS -= 5;
        if (WRONG_STREAK % 5 == 0 && WRONG_STREAK > 0) {
            DIFFICULTY ++;
            POINTS -= 10;
            document.querySelector("#level").textContent = `Level: ${LEVELS[DIFFICULTY]}`
        };
        document.querySelector("#userGuess").value=''
        document.querySelector("#streak").setAttribute("style", `font-size: ${STREAK % 5 + 1}rem`)
        document.querySelector("#points").textContent = `Points: ${POINTS}`
        document.querySelector("#correct-count").textContent = `Correct: ${CORRECT_COUNT}/${CORRECT_COUNT+WRONG_COUNT} (${Math.round(CORRECT_COUNT/(CORRECT_COUNT+WRONG_COUNT)*100)}%)`
        document.querySelector("#correction").textContent = `Sorry, the answer was "${aTranslation}"`;
        setTimeout(() => {
            document.querySelector("#correction").setAttribute("style", "display: none");
        }, 1000);
        document.querySelector("#correction").setAttribute("style", "display: block");
        document.querySelector("#streak").textContent = `Streak: ${STREAK}`

        createWord(qWord, aTranslation, userGuess, qlang, alang, false, DIFFICULTY);

        getWord(DIFFICULTY);
    }
    } catch (error) {
    console.error(error);
    }
};

document.querySelector("#submit").addEventListener("click", handleGuess);


// initiate first word and styles
getWord(DIFFICULTY);
document.querySelector(".question-container").style.backgroundImage = images['en'];
document.querySelector(".answer-container").style.backgroundImage = images['he'];

// create Word object for database
async function createWord(qWord, aTranslation, userGuess, qlang, alang, correct, DIFFICULTY) {
    const wordObject = {
        "word": qWord,
        "translation": aTranslation,
        "user_guess": userGuess,
        "qlanguage": qlang,
        "alanguage": alang,
        "correct": correct,
        "difficulty": DIFFICULTY
    };
    console.log($('form').serialize().slice(20,84))
    const response = await fetch("/app/create-word/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": $('form').serialize().slice(20, 84)
        },
        body: JSON.stringify(wordObject)
    });
    const results = await response.json();
};