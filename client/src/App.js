import { useState } from 'react'

import './App.css'

function App() {
	const [ word, setWord ] = useState("")
	const [ anagrams, setAnagrams ] = useState([])

	const handleAnagramGeneration = async function() {
		try {
			const response = await fetch(`http://localhost:5000/api/get_anagrams/${word}`);
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
					
			const data = await response.json();	
			setAnagrams(data.results);
		} 
		catch (error) {
			console.log(error.message);
		}
	}

  return (
    <div className="App">
      <div>
				<label htmlFor="input_word">For anagram options, input word:</label> <br></br>
				<input id="input_word" type="text" value={word} onChange={e => setWord(e.target.value)}/> <br></br>
				<button onClick={handleAnagramGeneration}>Generate</button>
      </div>

			<ul>
				{ anagrams.map((anagram, index) => <li key={index}>{anagram}</li>) } 
			</ul>
    </div>
  )
}

export default App

