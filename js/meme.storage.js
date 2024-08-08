function _saveToStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value))
}

function _loadFromStorage(key){
    return JSON.parse(localStorage.getItem(key))
}