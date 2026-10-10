const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = 5000;

// --- Trust proxy (for rate limiting / HTTPS behind a reverse proxy) ---
app.set('trust proxy', 1);


// --- CORS ---
// allows cross-origin requests (configure origins in production)
const cors = require('cors');
app.use(
	cors({
		origin: 'http://localhost:3000'
	})
); 

// --- Security headers ---
const helmet = require('helmet');
app.use(helmet()); // sets various HTTP headers for security

// --- Logging (skip in test) ---
const morgan = require('morgan');
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // logs requests to the console
}

// --- Rate limiting ---
const rateLimit = require('express-rate-limit');
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
  })
);

// --- Body parsing ---
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form submissions

// --- Cookies ---
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// --- Static files ---
app.use(express.static(path.join(__dirname, 'public')));


// --- Query anagram possibilities ---
app.get('/api/get_anagrams/:word', async (req, res) => {
	const searchWordUpper = req.params.word.toUpperCase(); // Later validate or sanitize possible malicious string input for word

	let filteredWordsUpper;

	// Get file and filter matches by length of searchWordUpper and non-duplication i.e. not the same word as searchWordUpper
	try {
		const data = await fs.readFile('assets/words.txt', 'utf-8');

		filteredWordsUpper = data.split('\n')
		.filter(word => searchWordUpper.length === word.length && searchWordUpper !== word.toUpperCase()) // Later condition precludes exact input word i.e. duplicate 
		.map(word => word.toUpperCase()); // Avoid future case issues by capitalizing all possible anagrams
  } catch (err) {
    console.error('Failed to read file:', err);
  }

	// Get anagrams
	// Sort all characters per possible anagram to eliminate sequential or position differences, as well as char count, then keep or skip 
	let anagrams = [], isAnagram = false, searchWordUpperSorted = searchWordUpper.split('').sort().join('');

	for(let i = 0; i <= filteredWordsUpper.length - 1; i++) {
		if(filteredWordsUpper[i].split('').sort().join('') === searchWordUpperSorted) {
			anagrams.push(filteredWordsUpper[i]);
		}
	}

	// Filter anagrams found to only include dictionary-valid words
	let routeResponse = {}, dictionaryUrl = "https://freedictionaryapi.com/api/v1/entries/en/";
	routeResponse.results = [];

	try { 
		let response, data, anagramResponseObject, lookupLimit = anagrams.length < 50 ? anagrams.length : 50;

		for(let i = 0; i <= lookupLimit - 1; i++) {
			response = await fetch(`${dictionaryUrl}` + `${anagrams[i].toLowerCase()}`); // Lowercase required for this API
			data = await response.json();

      // This clause affirms that the anagram[i] has a response from the dictionary lookup i.e. the word has meaning
      // It further determines the correct 'definition' for the anagramResponseObject, especially when there are multiple senses or meanings of the word; pref. common nouns// Determines the correct 'definition' for the anagramResponseObject, especially when there are multiple senses or meanings of the word; pref. common nouns
			if(data.entries.length > 0) {
        let definition = "", nounEntries = [], nonNounEntries = [], senseSearchEntries

        // Categorise by partOfSpeech; nouns will be given priority consideration 
        data.entries.forEach(entry => entry.partOfSpeech.toLowerCase() === "noun" ? nounEntries.push(entry) : nonNounEntries.push(entry));
        senseSearchEntries = nounEntries.length ? [...nounEntries] : [...nonNounEntries];

        // Search reduced entries for definition from non-obsolete sense of the word
        for(let j = 0, senses; j <= senseSearchEntries.length - 1 && !definition; j++) {
          if(!senseSearchEntries[j]?.senses) continue;

          senses = senseSearchEntries[j].senses;
          for(let k = 0, tempDef = "123"; k <= senses.length - 1 && !definition; k++) {
            if(!senses[k]?.definition) continue; 

            if(!senses[k].definition.includes("obsolete")) {
              definition = senses[k].definition;
            }
          }

          // Handle case where no 'definition' found on any entry or its senses
          if(j === senseSearchEntries.length - 1 && !definition) {
            definition = senseSearchEntries[j]?.senses[0]?.definition ?? "";
          }
        }

        anagramResponseObject = {
          word: anagrams[i],
          definition:  definition ? definition : "No definition available."
        }

				routeResponse.results.push(anagramResponseObject);
			}
		}
	}
	catch (error) {
		console.log(error);
		res.status(500).send();
		return;
	}

	// Respond
	res.json(routeResponse)
});


// --- 404 handler (after routes) ---
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Global error handler (must have 4 args, goes last) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
