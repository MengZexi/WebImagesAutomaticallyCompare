// ==UserScript==
// @name         Web_Image Automatic Comparing
// @namespace    http://tampermonkey.net/
// @version      v0.12
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
        modal.style.width = '80%';
        modal.style.height = '80%';
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
        const images = document.querySelectorAll('.ant-image-img.css-3v32pk');
        const content = modal.querySelector('#modalContent');
        content.innerHTML = ''; // Clear previous content

        if (images.length < 7) {
            content.textContent = 'Not enough images to display the required pattern!';
            return;
        }

        // Resize and display images in the specified layout
        const resizeWidth = '100px';
        const resizeHeight = '100px';
        const rows = [
            [0, 1, 2, 2],
            [0, 1, 3, 3],
            [0, 1, 4, 4],
            [0, 1, 5, 5],
            [0, 1, 6, 6],
        ];

        rows.forEach((rowIndexes) => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.justifyContent = 'center';
            rowDiv.style.marginBottom = '10px';

            rowIndexes.forEach((index) => {
                const img = images[index].cloneNode(true);
                img.style.width = resizeWidth;
                img.style.height = resizeHeight;
                img.style.margin = '5px';
                rowDiv.appendChild(img);
            });

            content.appendChild(rowDiv);
        });

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
    console.log('Web_Image Automatic Comparing : v0.10 Script Updated!');
})();
