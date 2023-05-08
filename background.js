let isExtensionRunning = false;

chrome.action.onClicked.addListener((tab) => {
  if (!isExtensionRunning) {
    isExtensionRunning = true;

    // Envía un mensaje a la pestaña activa para ejecutar el script
    chrome.tabs.sendMessage(tab.id, { action: 'executeScript' });

    // Deshabilita la extensión mientras se ejecuta
    chrome.action.disable();
  }
});