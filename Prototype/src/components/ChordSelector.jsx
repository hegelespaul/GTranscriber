const CHORDS = {
  Cmaj7: ['1-3', '0-1', '3-0', '4-2', '5-3', '6-x'],
  Abm7: ['1-4', '2-4', '3-4', '4-4', '5-x', '6-x'],
  D7: ['1-2', '2-1', '3-2', '4-0', '5-0', '6-x'],
  F:    ['1-1', '2-1', '3-2', '4-3', '5-3', '6-1'],
};

export default function ChordSelector({ selectedChord, onChange }) {
  return (
    <div className='chordSelector-container'>
      {Object.entries(CHORDS).map(([chordName, noteIds]) => (
        <div
          key={chordName}
          onClick={() => onChange(chordName, noteIds.filter(id => !id.includes('x')))}
          style={{
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            background: selectedChord === chordName ? '#10b981' : '#f0f0f0',
            color: selectedChord === chordName ? 'white' : '#333',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
          }}
        >
          {chordName}
        </div>
      ))}
    </div>
  );
}
