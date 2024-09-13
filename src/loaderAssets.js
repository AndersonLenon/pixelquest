const loadImage = async (url) => 
    new Promise((resolve) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.src = url;
    });

const loadAudio = async (url) =>
    new Promise((resolve) => {
        const audio = new Audio(url);
        audio.addEventListener('canplaythrough', () => resolve(audio));
    });

export { loadImage, loadAudio };
