'use strict'

let gElCanvas
let gCtx

function onInit(){
    const elGallery = document.querySelector('.gallery')
    let strHTML = ''
    getImgs().map(({url, id}) => {
        strHTML+= `<img onclick="onSelectImage('${id}')" 
        src="${url}" alt="">
        `
    })

    elGallery.innerHTML = strHTML

    gElCanvas = document.querySelector('.main-canvas')
    gCtx = gElCanvas.getContext('2d')
}

function loadGallery(){
    document.querySelector('.main-editor').classList.add('hidden')
    document.querySelector('.main-gallery').classList.remove('hidden')
}

function onSelectImage(idx){
    document.querySelector('.main-editor').classList.remove('hidden')
    document.querySelector('.main-gallery').classList.add('hidden')

    const elImg = new Image()
    elImg.src = `img/${idx}.jpg`
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
    }
    changeMeme('image', idx)
}

function changeColor({target}){
    changeMeme('text-color', target.value)
    renderMeme()   
}

function editText({target}){
    changeMeme('text', target.value)
    const meme = getMeme()
    renderMeme()   
}

function renderMeme(x, y){
    const meme = getMeme()
    const {text, color} = meme.lines[meme.selectedLineIdx]
    const elImg = new Image()
    elImg.src = `img/${meme.selectedImgId}.jpg`
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)

    gCtx.beginPath()
    gCtx.lineWidth = 2
    gCtx.strokeStyle = 'black'
    gCtx.fillStyle = color
    gCtx.font = '60px Arial'
    gCtx.textAlign = 'center'
    gCtx.textBaseline = 'middle'

    gCtx.fillText(text, gElCanvas.width / 2, gElCanvas.height / 2)
    gCtx.strokeText(text, gElCanvas.width / 2, gElCanvas.height / 2)
}