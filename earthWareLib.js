
// Prevent refresh page after submit photo
function preventDefault(event){
  event.preventDefault();
};
// Elemet configs starts
function afterLoadConfig(){
  photoForm = document.getElementById("photoForm");
  photoForm.addEventListener('submit', preventDefault);

  fileInputElement = document.getElementById("fileInput");
  fileSubmitElement = document.getElementById("fileSubmit");
  fileSubmitElement.disabled = true;

  fileInputElement.addEventListener("change", function () {
    if (fileInputElement.files.length > 0) {
      const fileSize = fileInputElement.files[0].size;
      const fileLimit = 1024 ** 2 * 5;
      if (fileSize >= fileLimit) {
        alert("Please select a file less than 5MB.");
        fileSubmitElement.disabled = true;
      } else {
        console.log("your file is " + (fileSize/(1024**2)).toFixed(2) + "MB.");
        fileSubmitElement.disabled = false;
      }
    }
  });
}
// Elemet configs ends

// Functions
async function recPhoto(fileInputId) {
  fileInputElement = document.getElementById("fileInput");
  fileInput = fileInputElement.files[0];
  fileName = fileInputElement.value;
  fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
  fileId = generateFileId() + "." + fileExtension;
  getBase64(fileInput)
  .then(fileBase64 => uploadPhoto(fileId, fileBase64))
  .then(ignore => invokeRekognition(fileId))
  .then(labelsText => showLabelsResult(labelsText))
  .catch(result => {
    showLabelsResult("failed to recognize photo!");
    console.log(result);
  });
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    showLabelsResult("Compressing photo ...");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}

function uploadPhoto(fileId, fileBase64) {
  return new Promise((resolve, reject) => {
    showLabelsResult("Uploading photo ...");
    body = {
      "intent": "upload_photo",
      "file_name": fileId,
      "photo": fileBase64
    };
    invokeOptions(body)
    .then(result => {
      msg = "upload photo successfully!"
      resolve(fileId);
    }).catch(result => {
      msg = "failed to upload photo!";
      reject(new Error(msg));
    }).finally(() => console.log(msg))
  });
}

function invokeRekognition(fileId) {
  return new Promise((resolve, reject) => {
    showLabelsResult("Recognize photo ...");
    body = {
      "intent": "recognize_photo",
      "file_name": fileId
    };
    invokeOptions(body)
    .then(result => {
      msg = "recognize photo successfully!";
      console.log(result);
      resolve(result.data.body)
    }).catch(result => {
      msg = "failed to recognize photo!";
      reject(new Error(msg));
    }).finally(() => console.log(msg))
  });
}

// common utils

function generateFileId() {
  return Date.now() + "_" + (Math.ceil(Math.random()*100) / 100).toString(36).substr(2);
};

function showLabelsResult(labelsText) {
  document.getElementById("labelsResult").innerHTML = labelsText
}

function invokeOptions(body) {
  return new Promise((resolve, reject) => {
  params = {
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Origin': '*'
  };
  additionalParams = {}
  apigClient = apigClientFactory.newClient({
    apiKey: '7LfpQiybC87fGlgr7LMxZ24YOXPjHeoy8BZCsPEy'
  });
  apigClient.rootOptions(params, body, additionalParams)
  .then(result => {
    resolve(result);
  }).catch(result => {
    reject(result);
  });
  });
}