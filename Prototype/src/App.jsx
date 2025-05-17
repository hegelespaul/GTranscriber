import { useState } from 'react';
import Header from './components/Header';
import FretboardSVG from "./components/FretboardSVG"
import ChordSelector from "./components/ChordSelector"
import Recorder from "./components/Recorder"
export default function GuitarApp() {
  const [selectedChord, setSelectedChord] = useState(null);
  const [activeNotes, setActiveNotes] = useState([]);

  const handleChordChange = (chordName, noteIds) => {
    setSelectedChord(chordName);
    setActiveNotes(noteIds); // Set only active fretted notes
  };

  return (
    <div className='main'>
      <Header />
      <Recorder setActiveNotes={setActiveNotes}/>
      <FretboardSVG activeNotes={activeNotes} setActiveNotes={setActiveNotes} />
      <ChordSelector selectedChord={selectedChord} onChange={handleChordChange} />
    </div>
  );
}
