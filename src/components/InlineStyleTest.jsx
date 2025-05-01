import React from 'react';

export default function InlineStyleTest() {
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '24rem',
      margin: '32px auto',
      backgroundColor: 'purple',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    circle: {
      height: '48px',
      width: '48px',
      backgroundColor: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'purple',
      fontWeight: 'bold',
      flexShrink: 0
    },
    title: {
      fontSize: '20px',
      fontWeight: '500',
      color: 'white',
      marginBottom: '4px'
    },
    text: {
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.circle}>
        I
      </div>
      <div>
        <div style={styles.title}>Inline Style Test</div>
        <p style={styles.text}>This uses inline styles (no Tailwind)</p>
      </div>
    </div>
  );
}
