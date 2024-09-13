import { init } from './init.js';

document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.querySelector('canvas').style.display = 'block';
    init();
});

document.getElementById('instructionsButton').addEventListener('click', () => {
    alert('Use as setas do teclado para mover o personagem e use espaço para pular os quadrados vermelhos. Colete os quadrados verdes para coletar vida.');
});

document.getElementById('exitButton').addEventListener('click', () => {
    window.close();
});
