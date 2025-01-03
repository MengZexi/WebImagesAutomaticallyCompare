// ==UserScript==
// @name         Web_Image Automatic Comparing
// @namespace    http://tampermonkey.net/
// @version      v0.63
// @description  Typesetting the contents of the clipboard
// @author       Mozikiy
// @match        http://annot.xhanz.cn/project/*/*
// @match        https://annot.aminer.cn/project/*/*
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
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'white';
        modal.style.zIndex = '9998';
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

    function createDifferenceImage(img1, img2, resizeWidth = '400px', resizeHeight = '400px') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = parseInt(resizeWidth.replace('px', ''), 10);
        canvas.height = parseInt(resizeHeight.replace('px', ''), 10);

        const image1 = new Image();
        const image2 = new Image();

        image1.crossOrigin = 'anonymous';
        image2.crossOrigin = 'anonymous';

        image1.src = img1.src;
        image2.src = img2.src;

        let loadedCount = 0;

        const onLoadCallback = () => {
            loadedCount++;
            if (loadedCount === 2) {
                ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
                const imgData1 = ctx.getImageData(0, 0, canvas.width, canvas.height);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image2, 0, 0, canvas.width, canvas.height);
                const imgData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);

                const diffData = ctx.createImageData(canvas.width, canvas.height);

                for (let i = 0; i < imgData1.data.length; i += 4) {
                    diffData.data[i] = Math.abs(imgData1.data[i] - imgData2.data[i]); // R
                    diffData.data[i + 1] = Math.abs(imgData1.data[i + 1] - imgData2.data[i + 1]); // G
                    diffData.data[i + 2] = Math.abs(imgData1.data[i + 2] - imgData2.data[i + 2]); // B
                    diffData.data[i + 3] = 255;
                }

                ctx.putImageData(diffData, 0, 0);
            }
        };

        image1.onload = onLoadCallback;
        image2.onload = onLoadCallback;

        image1.onerror = () => {
            console.error("Failed to load image1 due to cross-origin restrictions.");
        };
        image2.onerror = () => {
            console.error("Failed to load image2 due to cross-origin restrictions.");
        };

        return canvas;
    }

    // Function to populate images in the modal
    function populateImages(modal) {
        const root = document.querySelector('#root');
        const images = root ? root.querySelectorAll('.ant-image-img.css-3v32pk') : [];
        const content = modal.querySelector('#modalContent');

        content.innerHTML = ''; // Clear previous content

        // Extract content from pre element with class "sc-bBeLha ibkpEM"
        let preElements = document.querySelectorAll('.sc-bBeLha.ibkpEM');

        if (preElements.length === 0) {
            preElements = document.querySelectorAll('.sc-hGNhLO.bwYNRA');
        }
        if (preElements.length > 0) {
            console.log('Find:', preElements);
        } else {
            console.log('No <pre> element with class "sc-bBeLha ibkpEM" found on the page.');
        }

        

        let textSegments = [];
        if (preElements.length > 0) {
            const textContent = preElements[0].textContent;

            const userInstructionMarker = '用户指令:';
            const completedStepsMarker = '已完成历史步骤:';
            const previousStepMarker = '上一个步骤描述:';
            const nextStepMarker = '下一个步骤描述:';

            const userInstructionIndex = textContent.indexOf(userInstructionMarker);
            const completedStepsIndex = textContent.indexOf(completedStepsMarker);
            const previousStepIndex = textContent.indexOf(previousStepMarker);
            const nextStepIndex = textContent.indexOf(nextStepMarker);

            const segment1 = textContent.slice(previousStepIndex + previousStepMarker.length, nextStepIndex).trim();
            const segment2 = textContent.slice(nextStepIndex + nextStepMarker.length).trim();
            const segment3 = textContent.slice(userInstructionIndex + userInstructionMarker.length, completedStepsIndex).trim();
            const segment4 = textContent.slice(completedStepsIndex + completedStepsMarker.length, previousStepIndex).trim();

            textSegments = [segment1, segment2, segment3, segment4].filter(segment => segment.trim() !== '');
        } else {
            console.warn('No <pre> element with class "sc-bBeLha ibkpEM" found on the page.');
        }

        // Create a new list to store unique elements
        const uniqueImages = [];
        images.forEach((img, index) => {
            if (index >= 2 && !uniqueImages.includes(img)) {
                uniqueImages.push(img);
            }
        });
        let images_count = uniqueImages.length;

        // Resize and display images in the specified layout
        const resizeWidth = '500px';
        const resizeHeight = '500px';

        const radioGroups = document.querySelectorAll('div.ant-radio-group-outline');

        const statusMapping = {
            1: "未加载",
            2: "未加载元素",
            3: "已加载元素",
            4: "其他",
            5: "完成",
            6: "跳过"
        };

        const textContainer = document.createElement('div');
        textContainer.style.display = 'flex';
        textContainer.style.justifyContent = 'center';
        textContainer.style.marginBottom = '10px';

        for (let segIndex = 0; segIndex < textSegments.length; segIndex++) {
            const textElement = document.createElement('p');
            textElement.textContent = textSegments[segIndex];
            textElement.style.whiteSpace = 'pre-wrap';
            textElement.style.margin = '0 20px';
            textElement.style.textAlign = 'center';
            textContainer.appendChild(textElement);
        }
        content.appendChild(textContainer);

        for (let row = 0; row < images_count - 2; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.justifyContent = 'space-between'; // 均匀分布
            rowDiv.style.flexWrap = 'wrap'; // 允许换行
            rowDiv.style.marginBottom = '10px';
        
            for (let col = 0; col < 4; col++) {
                let index;
                let img;
        
                if (col === 0 || col === 1) {
                    index = col;
                    img = uniqueImages[index].cloneNode(true);
                } else if (col === 2) {
                    index = row + 2;
                    img = uniqueImages[index].cloneNode(true);
                } else if (col === 3) {
                    const secondImage = uniqueImages[1];
                    const thirdImage = uniqueImages[row + 2];
                    img = createDifferenceImage(secondImage, thirdImage, resizeWidth, resizeHeight);
                }
        
                img.style.width = 'calc(25% - 10px)'; // 25% - 10px margin
                img.style.height = 'auto';
                img.style.margin = '5px';
        
                if(col !== 3) {
                    img.onclick = () => {
                        const modal = document.createElement('div');
                        modal.style.position = 'fixed';
                        modal.style.top = '0';
                        modal.style.left = '0';
                        modal.style.width = '100%';
                        modal.style.height = '100%';
                        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        modal.style.display = 'flex';
                        modal.style.justifyContent = 'center';
                        modal.style.alignItems = 'center';
                        modal.style.zIndex = '9999';
                        modal.style.flexDirection = 'column';
                        modal.style.overflow = 'hidden';
                    
                        const closeButton = document.createElement('div');
                        closeButton.textContent = 'X';
                        closeButton.style.position = 'absolute';
                        closeButton.style.top = '20px';
                        closeButton.style.right = '20px';
                        closeButton.style.fontSize = '24px';
                        closeButton.style.color = 'white';
                        closeButton.style.cursor = 'pointer';
                        closeButton.style.fontWeight = 'bold';
                        closeButton.onclick = () => {
                            modal.remove();
                        };
                    
                        const fullSizeImg = document.createElement('img');
                        fullSizeImg.src = img.src;
                        fullSizeImg.style.maxWidth = '90%';
                        fullSizeImg.style.maxHeight = '90%';
                        fullSizeImg.style.border = '2px solid white';
                        fullSizeImg.style.objectFit = 'contain';
                    
                        modal.onclick = (event) => {
                            if (event.target === modal) {
                                modal.remove();
                            }
                        };

                        modal.appendChild(closeButton);
                        modal.appendChild(fullSizeImg);

                        document.body.appendChild(modal);
                    };
                }
        
                rowDiv.appendChild(img);
            }
        
            content.appendChild(rowDiv);
        
            // Add a button group for the row
            const buttonGroupDiv = document.createElement('div');
            buttonGroupDiv.style.display = 'flex';
            buttonGroupDiv.style.justifyContent = 'center';
            buttonGroupDiv.style.marginTop = '5px';
        
            // Create and append 5 buttons
            for (let i = 1; i <= 6; i++) {
                const button = document.createElement('button');
                button.textContent = statusMapping[i];
                button.style.margin = '0 5px';
                button.style.padding = '5px 10px';
                button.style.cursor = 'pointer';
                button.onclick = () => {
                    if (i == 5 || i == 6) {
                        for (let r = row; r < images_count - 2; r++) {
                            const group = radioGroups[r];
                            if (group) {
                                const radioInput = group.querySelector(`input[type="radio"][value="${i - 1}"]`);
                                if (radioInput) {
                                    radioInput.click();
                                }
                            }
                        }
                        modal.style.display = 'none';
                    } else {
                        const group = radioGroups[row];
                        if (group) {
                            const radioInput = group.querySelector(`input[type="radio"][value="${i - 1}"]`);
                            if (radioInput) {
                                radioInput.click();
                                console.log(`click row ${row + 1} , value=${i} `);
                            } else {
                                console.log(`click row ${row + 1}, value=${i}`);
                            }
                        } else {
                            console.log(`no row ${row + 1}  radioGroup`);
                        }
                    }
                };
                buttonGroupDiv.appendChild(button);
            }
        
            // Append the button group after the rowDiv
            content.appendChild(buttonGroupDiv);
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

    // Add event listener for CTRL+B
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'b') {
            event.preventDefault();
            // populateImages(modal);
            modal.style.display = 'none';
        }
    });

    // Log script initialization
    console.log('Web_Image Automatic Comparing : v0.63 Script Updated!');
})();
