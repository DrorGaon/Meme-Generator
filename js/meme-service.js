'use strict'

let gImgs = [
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

let gMeme = {
    selectedImgId: 2,
    selectedLineIdx: 0,
    isDrag: false,
    lines: [
        {
            text: 'Sample text',
            size: 42,
            color: 'white',
            pos: {x: 250, y:250},
        }
    ],
}

function getImgs(){
    return gImgs
}

function getMeme(){
    return gMeme
}

function editMeme(target, value){
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
        case 'text-size':
            gMeme.lines[gMeme.selectedLineIdx].size = value
            break;
        case 'increase':
            gMeme.lines[gMeme.selectedLineIdx].size++ 
            break;
        case 'decrease':
            gMeme.lines[gMeme.selectedLineIdx].size--
            break;
        }
}

function isLineClicked({x, y}){
    const {width, height} = getWidthAndHeight()

     return (Math.abs(gMeme.lines[gMeme.selectedLineIdx].pos.x - x) < width / 2 && Math.abs(gMeme.lines[gMeme.selectedLineIdx].pos.y - y) < height / 2)
}

function getWidthAndHeight(){
    const width = gCtx.measureText(gMeme.lines[gMeme.selectedLineIdx].text).width
    const height = gCtx.measureText(gMeme.lines[gMeme.selectedLineIdx].text).fontBoundingBoxAscent + gCtx.measureText(gMeme.lines[0]).fontBoundingBoxDescent
    return {width, height}
}

function setLineDrag(isDrag){
    gMeme.isDrag = isDrag
}

function moveLine(dx, dy){
    gMeme.lines[gMeme.selectedLineIdx].pos.x += dx
    gMeme.lines[gMeme.selectedLineIdx].pos.y += dy
}