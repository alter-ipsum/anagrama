import { useState } from 'react'

import './App.css'

function App() {
	const [ word, setWord ] = useState("")
	const [ anagrams, setAnagrams ] = useState([])

	const handleAnagramGeneration = function() {

	}

  return (
    <div className="App">
      <div>
				<label for="input_word">For anagram options, input word:</label> <br></br>
				<input id="input_word" type="text" value={word} onChange={e => setWord(e.target.value)} /> <br></br>
				<button onClick={handleAnagramGeneration}>Generate</button>
      </div>
    </div>
  )
}

export default App

