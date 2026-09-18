const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = 5000;

// --- Trust proxy (for rate limiting / HTTPS behind a reverse proxy) ---
app.set('trust proxy', 1);


// --- CORS ---
const cors = require('cors');
app.use(cors()); // allows cross-origin requests (configure origins in production)

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
	const searchWordUpper = req.params.word.toUpperCase() // Later validate or sanitize possible malicious string input for :word
	let filteredWords 

	try {
		const data = await fs.readFile('assets/words.txt', 'utf-8');
		filteredWords = data.split('\n')
		.filter(word => word.toUpperCase()[0] === searchWordUpper[0] && word.length === searchWordUpper.length && word.toUpperCase() !== searchWordUpper)
		.map(word => word.toUpperCase()) // Avoid future case issues by capitalizing all possible anagrams
  } catch (err) {
    console.error('Failed to read file:', err);
  }
	
	// Get anagrams
	let anagrams = [], isAnagram = false, searchWordCharCount = {} 

	searchWordUpper.split('').forEach(chr => searchWordCharCount[chr] = searchWordCharCount[chr] ? searchWordCharCount[chr] + 1 : 1) // Extract distinct search-word char count
	console.log(searchWordCharCount)

	filteredWords.forEach(word => { 
		// console.log(word)

		isAnagram = word.split('').every(chr => {
			console.log(searchWordCharCount[chr]) 
			if(searchWordCharCount[chr] && searchWordCharCount[chr] > 0) {
				console.log(chr)
				searchWordCharCount[chr]--
				return true
			}
			else {
				return false
			}
		})

		if(isAnagram) anagrams.push(word)
	})

	console.log(anagrams)
	
	// Return
  res.send('Hello, Express!');
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
