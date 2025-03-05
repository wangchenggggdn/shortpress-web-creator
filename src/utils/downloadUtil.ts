/**
 * Download file from URL
 * @param url File URL
 * @param fileName Name to save the file as
 */
const downloadSource = (url: string, fileName: string) => {
    const downloadLink = document.createElement('a');
    downloadLink.target = '_blank';
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

/**
 * Download video file
 * @param url Video URL
 * @param name Name to save the video as
 */
export const downloadVideo = (url: string, name: string) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer'; // Response type as blob
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const blob = this.response;
            // Create blob URL
            const u = window.URL.createObjectURL(new Blob([blob], { type: 'video/mp4' })); // Video type is video/mp4, image is image/jpeg
            const a = document.createElement('a');
            a.download = name; // Set download filename
            a.href = u;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    };
    xhr.send();
};

/**
 * Download image file using canvas to avoid preview
 * @param url Image URL
 * @param fileName Name to save the image as
 */
export const downloadByCanvasToBlob = (url: string, fileName: string) => {
    const img = new Image();
    // Add crossOrigin attribute for cross-origin images, otherwise canvas will be tainted
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        // Draw image to canvas
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        // Convert to blob
        canvas.toBlob(blob => {
            const downloadLink = document.createElement('a');
            const blobData = URL.createObjectURL(blob!);
            downloadLink.href = blobData;
            downloadLink.target = '_blank';
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });
    };
    img.src = url;
};

/**
 * Get image extension from path
 * @param imagePath Path to the image
 * @returns Image extension or empty string if no extension found
 */
export const getImageExtension = (imagePath: string) => {
    // Split path string by '.' into array
    const parts = imagePath.split('.');

    // Get last element as image extension
    const extension = parts[parts.length - 1];

    // Return image extension or empty string if no extension found
    return extension;
};

/**
 * Download audio file
 * @param url Audio URL
 * @param name Name to save the audio as
 */
export const downloadAudio = (url: string, name: string) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer'; // Response type as blob
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const blob = this.response;
            // Create blob URL
            const u = window.URL.createObjectURL(new Blob([blob], { type: 'audio/mp3' })); // Audio type is audio/mp3
            const a = document.createElement('a');
            a.download = name; // Set download filename
            a.href = u;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    };
    xhr.send();
};

export default downloadSource;
