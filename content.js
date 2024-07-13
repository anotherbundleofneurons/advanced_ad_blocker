let isEnabled = true;
let isSelectMode = false;
let blockedElements = [];
let highlightedElement = null;

function applyBlocking() {
  if (!isEnabled) return;
  
  blockedElements.forEach(selector => {
    const elementsToHide = document.querySelectorAll(selector);
    elementsToHide.forEach(el => {
      el.style.display = 'none';
    });
  });
}

function saveBlockedElements() {
  chrome.storage.sync.set({ blockedElements: blockedElements }, () => {
    console.log('Blocked elements saved');
  });
}

function loadBlockedElements() {
  chrome.storage.sync.get(['blockedElements', 'isEnabled'], function(result) {
    if (result.blockedElements) {
      blockedElements = result.blockedElements;
    }
    if (result.isEnabled !== undefined) {
      isEnabled = result.isEnabled;
    }
    applyBlocking();
  });
}

function getUniqueSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className) return `.${element.className.split(' ').join('.')}`;
  let selector = element.tagName.toLowerCase();
  let siblings = element.parentNode.children;
  for (let i = 0; i < siblings.length; i++) {
    if (siblings[i] === element) {
      selector += `:nth-child(${i + 1})`;
      break;
    }
  }
  return selector;
}

function highlightElement(element) {
  if (highlightedElement) {
    highlightedElement.style.outline = '';
  }
  element.style.outline = '2px solid red';
  highlightedElement = element;
}

function removeHighlight() {
  if (highlightedElement) {
    highlightedElement.style.outline = '';
    highlightedElement = null;
  }
}

function handleMouseOver(e) {
  if (!isSelectMode) return;
  highlightElement(e.target);
}

function handleClick(e) {
  if (!isSelectMode) return;
  e.preventDefault();
  e.stopPropagation();
  
  const selector = getUniqueSelector(e.target);
  if (confirm(`Do you want to block this element? (${selector})`)) {
    blockedElements.push(selector);
    saveBlockedElements();
    applyBlocking();
  }
  
  exitSelectMode();
}

function enterSelectMode() {
  isSelectMode = true;
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('click', handleClick);
}

function exitSelectMode() {
  isSelectMode = false;
  document.body.style.cursor = 'default';
  removeHighlight();
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('click', handleClick);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateState") {
    isEnabled = request.isEnabled;
    applyBlocking();
    sendResponse({ success: true });
  } else if (request.action === "enterSelectMode") {
    enterSelectMode();
    sendResponse({ success: true });
  } else if (request.action === "exitSelectMode") {
    exitSelectMode();
    sendResponse({ success: true });
  } else if (request.action === "getBlockedElements") {
    sendResponse({ blockedElements: blockedElements });
  } else if (request.action === "removeBlockedElement") {
    blockedElements.splice(request.index, 1);
    saveBlockedElements();
    applyBlocking();
    sendResponse({ success: true });
  }
  return true;
});

// Initialize
loadBlockedElements();

// Apply blocking whenever the DOM changes
new MutationObserver(applyBlocking).observe(document.body, { childList: true, subtree: true });