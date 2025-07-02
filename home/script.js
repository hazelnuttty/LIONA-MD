AOS.init({
  duration: 800,
  once: true,
});

function hidePopup() {
  document.getElementById('popup').style.display = 'none';
}

function openWhatsApp() {
  window.open('https://whatsapp.com/channel/0029VbBCUqc5fM5bNGBPgZ2q', '_blank');
}
