let gElCanvas
let gCtx

function onInit(){
    gElCanvas = document.querySelector('.main-canvas')
    gCtx = gElCanvas.getContext('2d')
    restartCanvas()
}

function restartCanvas(){
    gCtx.beginPath()
    gCtx.fillStyle = 'white'
    gCtx.rect(0, 0, gElCanvas.width, gElCanvas.height)
    gCtx.fill()
}