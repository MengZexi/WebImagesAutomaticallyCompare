// ==UserScript==
// @name         Web_Image Automatic Comparing
// @namespace    http://tampermonkey.net/
// @version      v0.13
// @description  Typesetting the contents of the clipboard
// @author       Mozikiy
// @match        http://annot.xhanz.cn/project/*/*
// @icon         https://www.latex-project.org/favicon.ico
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    

    // Function to create a modal popup
    function createModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '90%';
        modal.style.height = '90%';
        modal.style.backgroundColor = 'white';
        modal.style.zIndex = '10000';
        modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
        modal.style.overflowY = 'scroll';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.display = 'none';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            modal.style.display = 'none';
        };
        modal.appendChild(closeButton);

        // Create content container for images
        const content = document.createElement('div');
        content.id = 'modalContent';
        modal.appendChild(content);

        document.body.appendChild(modal);
        return modal;
    }

    // Function to populate images in the modal
    function populateImages(modal) {
        // const images = document.querySelectorAll('.ant-image-img.css-3v32pk');
        const root = document.querySelector('#root'); // 获取 <div id="root">
        const images = root ? root.querySelectorAll('.ant-image-img.css-3v32pk') : []; // 在 #root 内查找图片
        const content = modal.querySelector('#modalContent');
        content.innerHTML = ''; // Clear previous content

        // Create a new list to store unique elements
        const uniqueImages = [];
        // Iterate over images, skipping the first two
        images.forEach((img, index) => {
            if (index >= 2 && !uniqueImages.includes(img)) {
                uniqueImages.push(img);
            }
        });
        let images_count = uniqueImages.length;
        console.log('Unique images Length:', images_count);

        // Resize and display images in the specified layout
        const resizeWidth = '350px';
        const resizeHeight = '350px';

        for (let row = 0; row < images_count - 2; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.justifyContent = 'center';
            rowDiv.style.marginBottom = '10px';
        
            for (let col = 0; col < 4; col++) { 

                let index;
                if (col === 0 || col === 1) {
                    index = col; // 第一列或第二列对应 0 或 1
                } else {
                    index = row + 2; // 第三列或第四列计算索引
                }

                if (index >= uniqueImages.length) break;
        
                const img = uniqueImages[index].cloneNode(true);
                img.style.width = resizeWidth;
                img.style.height = resizeHeight;
                img.style.margin = '5px';
                rowDiv.appendChild(img);
            }
        
            content.appendChild(rowDiv);
        }

        if (content.childElementCount === 0) {
            content.textContent = 'No images to display!';
        }
    }


    // Initialize modal
    const modal = createModal();

    // Add event listener for CTRL+H
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'h') {
            event.preventDefault();
            populateImages(modal);
            modal.style.display = 'block';
        }
    });


    // Log script initialization
    console.log('Web_Image Automatic Comparing : v0.13 Script Updated!');
})();
