document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const blockElementButton = document.getElementById('blockElementButton');
  const blockedList = document.getElementById('blockedList');
  let isEnabled = true;
  let isSelectMode = false;

  function updateButtonState() {
    if (isEnabled) {
      toggleButton.textContent = "Disable Ad Blocker";
      toggleButton.classList.add('red');
    } else {
      toggleButton.textContent = "Enable Ad Blocker";
      toggleButton.classList.remove('red');
    }

    if (isSelectMode) {
      blockElementButton.textContent = "Cancel Selection";
      blockElementButton.classList.add('red');
    } else {
      blockElementButton.textContent = "Select Element to Block";
      blockElementButton.classList.remove('red');
    }
  }

  function updateBlockedList() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getBlockedElements"}, function(response) {
        blockedList.innerHTML = '<h3>Blocked Elements:</h3>';
        if (response && response.blockedElements && response.blockedElements.length > 0) {
          response.blockedElements.forEach((selector, index) => {
            const item = document.createElement('div');
            item.className = 'blocked-item';
            const selectorText = document.createElement('span');
            selectorText.textContent = selector;
            item.appendChild(selectorText);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-button';
            removeButton.onclick = function() {
              chrome.tabs.sendMessage(tabs[0].id, {action: "removeBlockedElement", index: index}, function() {
                updateBlockedList();
              });
            };
            item.appendChild(removeButton);
            blockedList.appendChild(item);
          });
        } else {
          blockedList.innerHTML += '<p>No elements blocked yet.</p>';
        }
      });
    });
  }

  chrome.runtime.sendMessage({action: "getState"}, function(response) {
    isEnabled = response.isEnabled;
    updateButtonState();
    updateBlockedList();
  });

  toggleButton.addEventListener('click', function() {
    isEnabled = !isEnabled;
    chrome.runtime.sendMessage({action: "toggleEnabled", isEnabled: isEnabled}, function() {
      updateButtonState();
    });
  });

  blockElementButton.addEventListener('click', function() {
    isSelectMode = !isSelectMode;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (isSelectMode) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "enterSelectMode"}, function() {
          updateButtonState();
          window.close(); // Close the popup to allow element selection
        });
      } else {
        chrome.tabs.sendMessage(tabs[0].id, {action: "exitSelectMode"}, function() {
          updateButtonState();
          updateBlockedList();
        });
      }
    });
  });

  updateBlockedList();
});


// document.addEventListener('DOMContentLoaded', function() {
//   const toggleButton = document.getElementById('toggleButton');
//   const blockElementButton = document.getElementById('blockElementButton');
//   const blockedList = document.getElementById('blockedList');
//   let isEnabled = true;
//   let isSelectMode = false;

//   function updateButtonState() {
//     toggleButton.textContent = isEnabled ? "Disable Ad Blocker" : "Enable Ad Blocker";
//     toggleButton.style.backgroundColor = isEnabled ? "#ff6666" : "#66ff66";
//     blockElementButton.textContent = isSelectMode ? "Cancel Selection" : "Select Element to Block";
//     blockElementButton.style.backgroundColor = isSelectMode ? "#ffaa00" : "#66ff66";
//   }

//   function updateBlockedList() {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {action: "getBlockedElements"}, function(response) {
//         blockedList.innerHTML = '<h3>Blocked Elements:</h3>';
//         if (response && response.blockedElements) {
//           response.blockedElements.forEach((selector, index) => {
//             const item = document.createElement('div');
//             item.textContent = selector;
//             const removeButton = document.createElement('button');
//             removeButton.textContent = 'Remove';
//             removeButton.onclick = function() {
//               chrome.tabs.sendMessage(tabs[0].id, {action: "removeBlockedElement", index: index}, function() {
//                 updateBlockedList();
//               });
//             };
//             item.appendChild(removeButton);
//             blockedList.appendChild(item);
//           });
//         }
//       });
//     });
//   }

//   chrome.runtime.sendMessage({action: "getState"}, function(response) {
//     isEnabled = response.isEnabled;
//     updateButtonState();
//     updateBlockedList();
//   });

//   toggleButton.addEventListener('click', function() {
//     isEnabled = !isEnabled;
//     chrome.runtime.sendMessage({action: "toggleEnabled", isEnabled: isEnabled}, function() {
//       updateButtonState();
//     });
//   });

//   blockElementButton.addEventListener('click', function() {
//     isSelectMode = !isSelectMode;
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       if (isSelectMode) {
//         chrome.tabs.sendMessage(tabs[0].id, {action: "enterSelectMode"}, function() {
//           updateButtonState();
//           window.close(); // Close the popup to allow element selection
//         });
//       } else {
//         chrome.tabs.sendMessage(tabs[0].id, {action: "exitSelectMode"}, function() {
//           updateButtonState();
//           updateBlockedList();
//         });
//       }
//     });
//   });

//   updateBlockedList();
// });