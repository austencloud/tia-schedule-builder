<div class="header">
  <h1>🦎 TIA Wildlife Museum Schedule 🐛</h1>
  <div class="subtitle">
    🌿 June 2025 Nature Heroes & Rescue Adventures 🦋
  </div>
  <div class="museum-tagline">
    🐨 Bug • Insect • Nature • Possum • Lizard • Wild Animal Rescue 🦘
  </div>
</div>

<style>
  .header {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    padding: 30px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .header::before {
    content: '🦋🐛🦎🐨🌿🦘🐾🍃🦗🐞🕷️🦋🐛🦎🐨🌿🦘🐾🍃🦗🐞🕷️';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 2em;
    opacity: 0.1;
    animation: floatEmojis 30s linear infinite;
    pointer-events: none;
  }

  @keyframes floatEmojis {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 300;
    position: relative;
    z-index: 1;
  }

  .header .subtitle {
    font-size: 1.2em;
    opacity: 0.9;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
  }

  .museum-tagline {
    font-size: 1em;
    opacity: 0.8;
    font-style: italic;
    position: relative;
    z-index: 1;
  }
</style>