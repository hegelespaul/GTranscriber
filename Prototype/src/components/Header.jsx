export default function Header() {
  return (
    <header style={styles.header}>
      <img src="/src/assets/logo.png" alt="Logo" style={styles.logo} />
      <h1 style={styles.title}>Guitar Transcriber</h1>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#222',
    color: '#fff',
    borderBottom: '4px solid #10b981',
    borderRadius: '0 0 12px 12px',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  title: {
    fontSize: '1.5rem',
    fontFamily: 'monospace',
    margin: 0,
  },
};
