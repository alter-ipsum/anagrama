import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const styles = {
  wrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'rgba(240, 253, 250, 0.85)', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    backdropFilter: 'blur(4px)',
  },
  
  card: {
    backgroundColor: '#ffffff', 
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(13, 148, 136, 0.2)',
    border: '1px solid rgba(20, 184, 166, 0.3)',
    overflow: 'hidden',
    maxWidth: '700px', // Slightly wider for grid
    width: '100%',
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh', // Prevents card from exceeding viewport height
  },
  header: {
    color: '#0d9488', 
    fontWeight: '800',
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subHeader: {
    color: '#14b8a6', 
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
  },
  input: {
    borderRadius: '12px',
    border: '2px solid #14b8a6', 
    fontSize: '1.1rem',
    padding: '12px 16px',
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '#ffffff',
		color: '#0d9488'
  },
  button: {
    backgroundColor: '#0d9488', 
    borderColor: '#0d9488',
    color: '#fff',
    fontWeight: '600',
    padding: '12px 32px',
    fontSize: '1.1rem',
    borderRadius: '12px',
    transition: 'transform 0.2s',
  },
  resultsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#f0fdfa',
    borderTop: '1px solid rgba(20, 184, 166, 0.1)',
    display: 'flex',           // Enables Flexbox
    flexDirection: 'column',   // Stacks badge and grid vertically
    alignItems: 'center',      // Horizontally centers everything inside
    justifyContent: 'flex-start',
  },
  grid: {
    display: 'flex',           // Switched from 'grid' to 'flex' for easier centering
    flexWrap: 'wrap',          // Allows items to wrap to next line
    justifyContent: 'center',  // Crucial: Centers items within the row
    gap: '16px',
    padding: '10px',
    maxWidth: '100%',          // Prevents overflow
    width: '100%',
  },
  anagramCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0f2f1',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80px',
    minWidth: '120px',         // Ensures cards don't get too squished
    maxWidth: '160px',         // Prevents them from getting too wide
    flex: '0 1 auto',          // Don't grow, shrink if needed, base size auto
  },
  anagramText: {
    color: '#0d9488',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  badge: {
    backgroundColor: '#f97316', 
    color: '#ffffff',
    fontWeight: '700',
    padding: '8px 16px',
    borderRadius: '50px',
    fontSize: '0.9rem',
    marginBottom: '15px',
    alignSelf: 'center',
    display: 'inline-block',
  }
};

function App() {
  const [word, setWord] = useState("");
  const [anagrams, setAnagrams] = useState([]);
  const [hasNoResults, setHasNoResults] = useState();
  const [hasAnagramMatches, setHasAnagramMatches] = useState();


  const handleAnagramGeneration = async function () {
    if (!word.trim()) return;
    
    try {
      const encodedWord = encodeURIComponent(word.trim());
      const response = await fetch(`http://localhost:5000/api/get_anagrams/${encodedWord}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }   

      const data = await response.json(); 

      setHasAnagramMatches(data.results.length > 0);
      setAnagrams(data.results);
    }   
    catch (error) {
      console.error("Error:", error.message);
      alert("Backend error. Check console.");
      setAnagrams([]);
    }   
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        
        <div className="p-5 pb-2">
          <div className="text-center">
            <h1 style={styles.header}>Anagrama</h1>
            <p style={styles.subHeader}>Uncover hidden words</p>
          </div>

          <div className="d-flex flex-column flex-md-row gap-3 mb-4">
            <Form.Control
              type="text"
              value={word}
              onChange={e => setWord(e.target.value)}
              placeholder="Type an individual word..."
              style={styles.input}
              onKeyDown={e => e.key === 'Enter' && handleAnagramGeneration()}
            />
            <Button 
              variant="primary" 
              onClick={handleAnagramGeneration}
              style={styles.button}
            >
              Generate
            </Button>
          </div>
        </div>

        {hasAnagramMatches ? (
          <div style={styles.resultsContainer}> 
            <div style={{marginTop: '24px', marginTop: '24px', textAlign: 'center'}}>
               <span style={styles.badge}>Found {anagrams.length} results</span>
            </div>

            <div style={styles.grid}>
              {anagrams.map((anagram, index) => (
                <div 
                  key={index} 
                  style={styles.anagramCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(13, 148, 136, 0.15)';
                    e.currentTarget.style.borderColor = '#0d9488';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#e0f2f1';
                  }}
                >
                  <div style={styles.anagramText}>{anagram}</div>
                </div>
              ))}
            </div>
          </div>
        ) 
        : 
        (
          hasAnagramMatches === false ?
          <div style={styles.resultsContainer}>
            <div className="text-center py-5 text-muted opacity-75">
              <p style={{...styles.badge, margin: 0}}>No Results !</p>
            </div>
          </div> :
          <div style={styles.resultsContainer}>
            <div className="text-center py-5 text-muted opacity-75">
              <h3 className="mb-3">Ready to Explore</h3>
              <p>Enter a word above to see its anagrams appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
