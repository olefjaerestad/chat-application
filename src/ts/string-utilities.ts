/**
* Convert blob to data URI.
* @param {File} blob
* @return {string}
* By Ole Fjarestad
*/
export const convertBlobToDataUri = async (blob: File): Promise<string | ArrayBuffer> => {
    return new Promise(resolve => {
        if (blob) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob);
            fileReader.addEventListener('load', () => {
                resolve(fileReader.result);
            });
        } else {
            resolve('');
        }
    });
}