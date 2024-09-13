let keys = [];

function keyDownUp(element) {
    element.addEventListener('keydown', addKey);
    element.addEventListener('keyup', removeKey);
}

const hasKey = (searchKey) => keys.includes(searchKey);

function addKey(event) {
    if (!hasKey(event.key)) {
        keys.push(event.key);
    }
}

function removeKey(event) { 
    keys = keys.filter(key => key !== event.key);
}

export { keyDownUp, hasKey };
1