'use strict'


const MEME_KEY = 'gMeme'
const IMG_KEY = 'gImgs'

let gImgs 
let gMeme 

const defaultLine = {
    text: 'Sample text',
    size: 42,
    font: 'Impact',
    color: 'gray',
    outline: 'black',
    pos: {x: 250, y:60},
}

function resetMeme(){
    gMeme.selectedImgId = 1
    gMeme.selectedLineIdx = 0
    gMeme.isDrag = false
    gMeme.lines.length = 0
    gMeme.lines.push(structuredClone(defaultLine))
}

function getImgs(){
    if(!localStorage.getItem(IMG_KEY)){
        _saveToStorage(IMG_KEY,[
                {id: 1, url: 'img/1.jpg', keywords: ['haha'],},
                {id: 2, url: 'img/2.jpg', keywords: ['haha'],},
                {id: 3, url: 'img/3.jpg', keywords: ['haha'],},
                {id: 4, url: 'img/4.jpg', keywords: ['haha'],},
                {id: 5, url: 'img/5.jpg', keywords: ['haha'],},
                {id: 6, url: 'img/6.jpg', keywords: ['haha'],},
                {id: 7, url: 'img/7.jpg', keywords: ['haha'],},
                {id: 8, url: 'img/8.jpg', keywords: ['haha'],},
                {id: 9, url: 'img/9.jpg', keywords: ['haha'],},
                {id: 10, url: 'img/10.jpg', keywords: ['haha'],},
                {id: 11, url: 'img/11.jpg', keywords: ['haha'],},
                {id: 12, url: 'img/12.jpg', keywords: ['haha'],},
                {id: 13, url: 'img/13.jpg', keywords: ['haha'],},
                {id: 14, url: 'img/14.jpg', keywords: ['haha'],},
                {id: 15, url: 'img/15.jpg', keywords: ['haha'],},
                {id: 16, url: 'img/16.jpg', keywords: ['haha'],},
                {id: 17, url: 'img/17.jpg', keywords: ['haha'],},
                {id: 18, url: 'img/18.jpg', keywords: ['haha'],},
            ]
        )
    }
    gImgs = _loadFromStorage(IMG_KEY)
    return gImgs
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
        line.pos.x = gMeme.lines[gMeme.selectedLineIdx].pos.x + 20
        line.pos.y = gMeme.lines[gMeme.selectedLineIdx].pos.y + 20
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
        gMeme.lines[gMeme.selectedLineIdx].pos.x = 250
        _saveToStorage(MEME_KEY, gMeme)
        return
    }

    const sizes = getLineSizes() 
    const size = sizes[gMeme.selectedLineIdx]
    let {width} = size
    if(direction === 'left'){
        gMeme.lines[gMeme.selectedLineIdx].pos.x = width / 2 + 20
    } else {
        gMeme.lines[gMeme.selectedLineIdx].pos.x = gElCanvas.width - width / 2 - 20
    }
    _saveToStorage(MEME_KEY, gMeme)
}

function isLineClicked({x, y}){
    const res = {isClicked: false, idx: 0}
    const lineSizes = getLineSizes()
    gMeme.lines.forEach((line, idx) => {
        const {width, height} = lineSizes[idx]
        if(Math.abs(line.pos.x - x) < width / 2 && Math.abs(line.pos.y - y) < height / 2){
            res.isClicked = true
            res.idx = idx
        }
    })

    return res
}

function getLineSizes(){
    let lineSizes = []
    lineSizes = gMeme.lines.map((line, idx) => {
        gCtx.font = `${line.size}px ${line.font}`
        let width = gCtx.measureText(line.text).width
        let height = gCtx.measureText(line.text).fontBoundingBoxAscent + gCtx.measureText(line.text).fontBoundingBoxDescent
        let size = {width, height, idx}
        return size
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