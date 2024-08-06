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
    editMeme('image', idx)
}

function changeColor({target}){
    document.querySelector('.text-color').style.color = target.value
    editMeme('text-color', target.value)
    renderMeme()   
}

function editText({target}){
    editMeme('text', target.value)
    const meme = getMeme()
    renderMeme()   
}

function renderMeme(){
    const meme = getMeme()
    const {text, color, size} = meme.lines[meme.selectedLineIdx]
    const elImg = new Image()
    elImg.src = `img/${meme.selectedImgId}.jpg`
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)

    gCtx.beginPath()
    gCtx.lineWidth = 2
    gCtx.strokeStyle = 'black'
    gCtx.fillStyle = color
    gCtx.font = `${size}px Arial`
    gCtx.textAlign = 'center'
    gCtx.textBaseline = 'middle'

    gCtx.fillText(text, gElCanvas.width / 2, gElCanvas.height / 2)
    gCtx.strokeText(text, gElCanvas.width / 2, gElCanvas.height / 2)

    document.querySelector('#text-size').value = size
}

function downloadImg(elLink){
    const imgContent = gElCanvas.toDataURL('image/jpeg') // image/jpeg the default format
    elLink.href = imgContent
}

function onTextSizeChange(elInput){
    let {value} = elInput
    if (!value){
        if(elInput.innerText === "-") editMeme('decrease')
        else editMeme('increase')
    } else editMeme('text-size', value)
    renderMeme()
}