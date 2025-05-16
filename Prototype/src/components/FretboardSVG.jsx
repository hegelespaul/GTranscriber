
export default function FretboardSVG({ activeNotes, setActiveNotes }) {
  const NUM_STRINGS = 6;
  const NUM_FRETS = 19;
  const STRING_SPACING = 30;
  const FRET_SPACING = 60;
  const NOTE_RADIUS = 10;
  const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'].reverse();
  const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19];

  const fretboardWidth = (NUM_FRETS + 1) * FRET_SPACING;
  const fretboardHeight = (NUM_STRINGS - 1) * STRING_SPACING;

  const toggleNote = (stringNumber, fret) => {
    const id = `${stringNumber}-${fret}`;
    setActiveNotes((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };


  const allElements = [];

  // Frets
  for (let i = 0; i <= NUM_FRETS; i++) {
    allElements.push(
      <line
        key={`fret-${i}`}
        x1={i * FRET_SPACING + 50}
        y1={50}
        x2={i * FRET_SPACING + 50}
        y2={fretboardHeight + 50}
        stroke="#333"
        strokeWidth={i === 0 ? 6 : 2}
      />
    );
  }

  // Strings
  for (let i = 0; i < NUM_STRINGS; i++) {
    allElements.push(
      <line
        key={`string-${i}`}
        x1={50}
        y1={i * STRING_SPACING + 50}
        x2={fretboardWidth - 10}
        y2={i * STRING_SPACING + 50}
        stroke="#555"
        strokeWidth={1.5}
      />
    );
  }

  // Fret markers
  for (let fret of FRET_MARKERS) {
    const cx = fret * FRET_SPACING + 50 - FRET_SPACING / 2;
    const isDouble = fret === 12;
    if (isDouble) {
      allElements.push(
        <circle key={`marker-${fret}-1`} cx={cx} cy={50 + STRING_SPACING * 1.5} r={6} fill="#999" />,
        <circle key={`marker-${fret}-2`} cx={cx} cy={50 + STRING_SPACING * 3.5} r={6} fill="#999" />
      );
    } else {
      allElements.push(
        <circle key={`marker-${fret}`} cx={cx} cy={50 + fretboardHeight / 2} r={6} fill="#999" />
      );
    }
  }

  for (let stringIdx = 0; stringIdx < NUM_STRINGS; stringIdx++) {
    const stringNumber = stringIdx + 1; 

    for (let fret = 0; fret <= NUM_FRETS; fret++) {
      const id = `${stringNumber}-${fret}`; 
      const isActive = activeNotes.includes(id);

      
      const x = fret === 0
      ? 50  
      : fret * FRET_SPACING + 50 - FRET_SPACING / 2;

      const y = stringIdx * STRING_SPACING + 50;

      if (isActive) {
        allElements.push(
          <circle
            key={`note-${id}`}
            cx={x}
            cy={y}
            r={NOTE_RADIUS}
            fill="#10b981"
            stroke="#222"
            strokeWidth={1.5}
          />
        );
      } else {
        allElements.push(
          <rect
            key={`clickzone-${id}`}
            x={x - NOTE_RADIUS}
            y={y - NOTE_RADIUS}
            width={NOTE_RADIUS * 2}
            height={NOTE_RADIUS * 2}
            fill="transparent"
          />
        );
      }
    }
  }


  // String labels
  for (let i = 0; i < STRING_NAMES.length; i++) {
    allElements.push(
      <text
        key={`label-${i}`}
        x={15}
        y={i * STRING_SPACING + 55}
        fontSize={12}
        fontFamily="monospace"
        fill="#444"
      >
        {STRING_NAMES[i]}
      </text>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto'}}>
      <svg
        viewBox={`0 0 ${fretboardWidth + 25} ${fretboardHeight + 100}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', background: '#f4f4f4', borderRadius: 12 }}
      >
        {allElements}
      </svg>
    </div>
  );
}
