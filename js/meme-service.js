'use strict'


const MEME_KEY = 'gMeme'
const IMG_KEY = 'gImgs'
const SAVED_MEMES_KEY = 'savedMemes'

let gImgs 
let gMeme 
let gFilter = ''

const defaultLine = {
    text: 'Sample text',
    size: 42,
    font: 'Impact',
    color: 'black',
    outline: 'gray',
    pos: {x: 0.5, y: 0.12},
}

function resetMeme(){
    gMeme.selectedImgId = 1
    gMeme.selectedLineIdx = 0
    gMeme.isDrag = false
    gMeme.lines.length = 0
    gMeme.lines.push(structuredClone(defaultLine))
}

function getImgs(){
    if(gFilter) return gFilter
    if(!localStorage.getItem(IMG_KEY)){
        _saveToStorage(IMG_KEY,[
                {id: 1, url: 'img/1.jpg', keywords: ['angry', 'person', 'politics'],},
                {id: 2, url: 'img/2.jpg', keywords: ['cute', 'animals'],},
                {id: 3, url: 'img/3.jpg', keywords: ['happy', 'cute', 'animals', 'baby'],},
                {id: 4, url: 'img/4.jpg', keywords: ['animals', 'cute'],},
                {id: 5, url: 'img/5.jpg', keywords: ['happy', 'baby'],},
                {id: 6, url: 'img/6.jpg', keywords: ['crazy', 'person'],},
                {id: 7, url: 'img/7.jpg', keywords: ['baby', 'surprised'],},
                {id: 8, url: 'img/8.jpg', keywords: ['person', 'crazy', 'happy'],},
                {id: 9, url: 'img/9.jpg', keywords: ['baby', 'crazy', 'happy'],},
                {id: 10, url: 'img/10.jpg', keywords: ['person', 'happy', 'politics'],},
                {id: 11, url: 'img/11.jpg', keywords: ['person', 'love'],},
                {id: 12, url: 'img/12.jpg', keywords: ['person', 'crazy', 'serious'],},
                {id: 13, url: 'img/13.jpg', keywords: ['person', 'happy'],},
                {id: 14, url: 'img/14.jpg', keywords: ['person', 'serious'],},
                {id: 15, url: 'img/15.jpg', keywords: ['person', 'serious'],},
                {id: 16, url: 'img/16.jpg', keywords: ['person', 'happy'],},
                {id: 17, url: 'img/17.jpg', keywords: ['person', 'serious', 'politics'],},
                {id: 18, url: 'img/18.jpg', keywords: ['crazy', 'happy'],},
            ]
        )
    }
    gImgs = _loadFromStorage(IMG_KEY)
    return gImgs
}

function filterImgs(filter){
    if(!filter){
        gFilter = ''
        return
    }

    let filteredImgs = gImgs.filter(img => {
        let searchWords = img.keywords.join(' ')
        return (searchWords.includes(filter))
    })
    gFilter = filteredImgs
}

function getMeme(){
    if(!localStorage.getItem(MEME_KEY)){
        _saveToStorage(MEME_KEY, {
            selectedImgId: 1,
            selectedLineIdx: 0,
            isDrag: false,
            lines:[structuredClone(defaultLine)]
        })
    }
    gMeme = _loadFromStorage(MEME_KEY)
    return gMeme
}

function editMeme(target, value){
    if(!gMeme.lines.length) return

    switch (target) {
        case 'image':
            gMeme.selectedImgId = value
            break;
        case 'text':
            gMeme.lines[gMeme.selectedLineIdx].text = value
            break;
        case 'text-color':
            gMeme.lines[gMeme.selectedLineIdx].color = value
            break;
        case 'text-outline':
            gMeme.lines[gMeme.selectedLineIdx].outline = value
            break;
        case 'text-size':
            gMeme.lines[gMeme.selectedLineIdx].size = value
            break;
        case 'increase':
            gMeme.lines[gMeme.selectedLineIdx].size++ 
            break;
        case 'decrease':
            gMeme.lines[gMeme.selectedLineIdx].size--
            break;
        case 'font':
            gMeme.lines[gMeme.selectedLineIdx].font = value
            break;
        }
        _saveToStorage(MEME_KEY, gMeme)
}

function setSelectedLine(idx){
    gMeme.selectedLineIdx = idx //visual changes handled in controller
    _saveToStorage(MEME_KEY, gMeme)
}

function addLine(){
    const line = structuredClone(defaultLine)
    if(gMeme.lines.length && gMeme.selectedLineIdx !== -1){
        line.pos.x = gMeme.lines[gMeme.selectedLineIdx].pos.x + 0.04
        line.pos.y = gMeme.lines[gMeme.selectedLineIdx].pos.y + 0.04
    } 
    gMeme.lines.push(line)
    gMeme.selectedLineIdx = gMeme.lines.length-1
    _saveToStorage(MEME_KEY, gMeme)
}

function deleteLine(){
    if(!gMeme.lines.length) return
    const {lines} = gMeme

    lines.splice(gMeme.selectedLineIdx, 1)
    if(gMeme.selectedLineIdx === lines.length) gMeme.selectedLineIdx = 0
    _saveToStorage(MEME_KEY, gMeme)
}

function alignText(direction){
    if(direction === 'center'){
        gMeme.lines[gMeme.selectedLineIdx].pos.x = 0.5
        _saveToStorage(MEME_KEY, gMeme)
        return
    }

    const sizes = getLineSizes() 
    const size = sizes[gMeme.selectedLineIdx]
    let {width} = size
    width /= gElCanvas.width

    if(direction === 'left'){
        gMeme.lines[gMeme.selectedLineIdx].pos.x = width / 2 + 0.04
    } else {
        gMeme.lines[gMeme.selectedLineIdx].pos.x = 1 - width / 2 - 0.04
    }
    _saveToStorage(MEME_KEY, gMeme)
}

function isLineClicked({x, y}){
    const res = {isClicked: false, idx: 0}
    const lineSizes = getLineSizes()
    gMeme.lines.forEach(({pos}, idx) => {
        let {width, height} = lineSizes[idx]
        width /= gElCanvas.width
        height /= gElCanvas.height
        if(Math.abs(pos.x - x) < width / 2 && Math.abs(pos.y - y) < height / 2){
            res.isClicked = true
            res.idx = idx
        }
    })

    return res
}

function getLineSizes(){
    let lineSizes = []
    lineSizes = gMeme.lines.map(({size, font, text}, idx) => {
        gCtx.font = `${size}px ${font}`
        let width = gCtx.measureText(text).width
        let height = gCtx.measureText(text).fontBoundingBoxAscent + gCtx.measureText(text).fontBoundingBoxDescent
        let dimensions = {width, height, idx}
        return dimensions
    })
    return lineSizes
}

function setLineDrag(isDrag){
    gMeme.isDrag = isDrag
    _saveToStorage(MEME_KEY, gMeme)
}

function moveLine(dx, dy){
    if(gMeme.selectedLineIdx === -1) return
    gMeme.lines[gMeme.selectedLineIdx].pos.x += dx
    gMeme.lines[gMeme.selectedLineIdx].pos.y += dy 
    _saveToStorage(MEME_KEY, gMeme)
}

function saveMeme(){
    let savedMemes
    let memeDataUrl = gElCanvas.toDataURL()
    const memeToSave = structuredClone(gMeme)
    if(!localStorage.getItem(SAVED_MEMES_KEY)){
        savedMemes = [{memeToSave, memeDataUrl}]
    } else {
        savedMemes = _loadFromStorage(SAVED_MEMES_KEY)
        savedMemes.push({memeToSave, memeDataUrl})
    }
    _saveToStorage(SAVED_MEMES_KEY, savedMemes)
}

function loadMemes(){
    const savedMemes = _loadFromStorage(SAVED_MEMES_KEY)
    const savedGallery = document.querySelector('.saved-memes-container')
    if(!savedMemes) {
        savedGallery.innerText = 'You have no saved memes...'
        return
    }
    let imgHtml = ''
    savedMemes.forEach((meme, idx) => {
        imgHtml += 
        `<img onclick="onLoadMeme('${idx}')" 
        src="${meme.memeDataUrl}" alt="">
        `
    })
    document.querySelector('.saved-memes-container').innerHTML = imgHtml
}

function loadMeme(idx){
    const savedMemes = _loadFromStorage(SAVED_MEMES_KEY)
    const meme = savedMemes[idx]
    _saveToStorage(MEME_KEY, meme.memeToSave)
}