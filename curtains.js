const imgCurtainsTop = document.createElement('img');
const imgCurtainsBottom = document.createElement('img');

imgCurtainsTop.src = 'imagens/curtains-top.png';
imgCurtainsTop.alt = 'Top part of the curtains';
imgCurtainsTop.style.width = '100%';

imgCurtainsBottom.src = 'imagens/curtains-bottom.png';
imgCurtainsBottom.alt = 'Bottom part of the curtains';
imgCurtainsBottom.style.width = '100%';

// Overlay styles
imgCurtainsTop.style.position = 'fixed';
imgCurtainsTop.style.top = '-100px';
imgCurtainsTop.style.left = '0';
imgCurtainsTop.style.zIndex = '-9';

imgCurtainsBottom.style.position = 'fixed';
imgCurtainsBottom.style.top = '-50px';
imgCurtainsBottom.style.left = '0';
imgCurtainsBottom.style.zIndex = '-9';

// Append to body
document.body.appendChild(imgCurtainsBottom);
document.body.appendChild(imgCurtainsTop);

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  // keep the initial -100px offset and subtract scroll
  imgCurtainsTop.style.top = `${-100 - scrollY}px`;
});