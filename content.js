chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "showWarning") {
    replacePageContent();
    showSafetyModal(true, message.message);
  } else if (message.action === "showSafe") {
    showSafetyModal(false); // Display safe site modal
  } else {
    console.error("Unknown action:", message.action); // Debugging unknown actions
  }
});
const imageUrl = chrome.runtime.getURL('icons/2.png');
const imageUrl1 = chrome.runtime.getURL('icons/1.png');

const showSafetyModal = (isPhishing, warningMessage = "") => {
  const modalContainer = document.createElement("div");
  modalContainer.style.position = "fixed";
  modalContainer.style.top = "10px"; // Adjust the top offset as needed
  modalContainer.style.right = "10px"; // Adjust the right offset as needed
  modalContainer.style.width = "max-content"; // Width of the modal can be auto or a specific value
  modalContainer.style.height = "max-content"; // Height of the modal can be auto or a specific value
  modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modalContainer.style.display = "flex";
  modalContainer.style.flexDirection = "column";
  modalContainer.style.borderRadius = "8px";
  modalContainer.style.zIndex = "10000";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.borderRadius = "8px";
  modalContent.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
  modalContent.style.width = "300px"; // Set the width of the modal content
  modalContent.style.height = "auto"; // Allow height to adjust based on content
  modalContent.style.alignItems = "center";
  modalContent.style.display = "flex";
  modalContent.style.justifyContent = "center";

  if (isPhishing) {
    modalContent.innerHTML = `
    <div style="width: 100%;display: flex;flex-direction: column;justify-content: center;align-items: center;">
        <img style="width: 100px; height: 100px;" src="${imageUrl}" alt="">
        <h1>PHISNET CURRENTLY</h1>
        <p style="color: rgb(8, 193, 8);">ENABLED</p>
        <div style="width: 90%; height: max-content;background-color: black;color: white;padding:8px;border-radius: 4px;margin-left: 4px;margin-right: 4px;text-align: center;">
            <p>WEBSITE URL: ${window.location.href}</p>
            <p>STATUS:<span style="color: ${
              isPhishing ? "red" : "green"
            };font-weight: bold;"> ${isPhishing ? "BLOCK" : "SAFE"}</span></p>
        </div>
        <button id="closeModal" style="padding: 2px; background-color: ${
          isPhishing ? "#f44336" : "#4CAF50"
        }; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">Close</button>
    </div>
  `;
  } else {
    modalContent.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <img style="width: 100px; height: 100px;" src="${imageUrl}" alt="">
        <h1 style="color:black;font-size:18px">PHISNET CURRENTLY</h1>
        <p style="color: rgb(8, 193, 8);">ENABLED</p>
      <div style="width: 90%; height: max-content; background-color: black; color: white; padding: 8px; border-radius: 4px; margin-left: 4px; margin-right: 4px; text-align: center;">
        <p>WEBSITE URL: ${window.location.href}</p>
        <p>STATUS: <span style="color: green; font-weight: bold;">SAFE</span></p>
      </div>
      <button id="closeModal" style="padding: 2px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">Close</button>
    </div>
  `;
  }

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  document.getElementById("closeModal").addEventListener("click", () => {
    document.body.removeChild(modalContainer);
    if (isPhishing) {
      blockSite(); // Block the site after the modal is closed
    }
  });
};

const replacePageContent = () => {
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: red; color: white;position:'relative'">
      <div style="position:absolute;top:10px;left:20px;z-index:99px;display:flex;gap:2;align-items:center;">
      <img src="${imageUrl1}" style="width:150px;height:150px;object-fit:fill;background:white;border-radius:50%;"  alt='logo' />
      <p style="font-size:34px;color:white;">PHISHNET</p>
      </div>
      <h1 style="font-size: 72px;">SUSPECTED PHISHINGs</h1>
      <p style="font-size: 32px;">This site is dangerous and has been blocked.</p>
  <p style="font-size:28px;">BLOCKED URL: ${window.location.href}</p>
    </div>
  `;
};

const blockSite = () => {
  // Replace with your logic to block the site
  // This will likely involve updating the blocking rules via background script
  chrome.runtime.sendMessage({ action: "blockSite" });
};
