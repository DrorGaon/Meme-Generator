'use strict'

let gElCanvas
let gCtx
let gStartPos

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']


function onInit() {
    const elGallery = document.querySelector('.gallery')
    let strHTML = ''
    getImgs().map(({ url, id }) => {
        strHTML += `<img onclick="onSelectImage('${id}')" 
        src="${url}" alt="">
        `
    })

    elGallery.innerHTML = strHTML

    gElCanvas = document.querySelector('.main-canvas')
    gCtx = gElCanvas.getContext('2d')
    addListeners()
}

function loadGallery() {
    document.querySelector('.main-editor').classList.add('hidden')
    document.querySelector('.main-gallery').classList.remove('hidden')
}

function onSelectImage(idx) {
    document.querySelector('.main-editor').classList.remove('hidden')
    document.querySelector('.main-gallery').classList.add('hidden')

    const elImg = new Image()
    elImg.src = `img/${idx}.jpg`
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
    }
    editMeme('image', idx)
}

function changeColor({ target }) {
    document.querySelector('.text-color').style.color = target.value
    editMeme('text-color', target.value)
    renderMeme()
}

function editText({ target }) {
    editMeme('text', target.value)
    const meme = getMeme()
    renderMeme()
}

function renderMeme() {
    const meme = getMeme()
    const { text, color, size, pos } = meme.lines[meme.selectedLineIdx]
    const { x, y } = pos
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

    gCtx.fillText(text, x, y)
    gCtx.strokeText(text, x, y)

    outlineText()
    document.querySelector('#text-size').value = size
}

function downloadImg(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg') // image/jpeg the default format
    elLink.href = imgContent
}

function onTextSizeChange(elInput) {
    let { value } = elInput
    if (!value) {
        if (elInput.innerText === "-") editMeme('decrease')
        else editMeme('increase')
    } else editMeme('text-size', value)
    renderMeme()
}

function onDown(ev) {
    const pos = getEvPos(ev)
    if (!isLineClicked(pos)) return

    setLineDrag(true)
    gStartPos = pos
}

function onMove(ev) {
    const { isDrag } = getMeme()
    if (!isDrag) return

    const pos = getEvPos(ev)
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y
    moveLine(dx, dy)
    gStartPos = pos
    renderMeme()
}

function onUp(ev) {
    setLineDrag(false)
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }

    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

function outlineText(){
    const {width, height} = getWidthAndHeight()
    const meme = getMeme()
    const {pos} = meme.lines[meme.selectedLineIdx]
    gCtx.beginPath()
    gCtx.strokeStyle = 'black'
    gCtx.rect((pos.x - width / 2) - 5, (pos.y - height / 2) - 5 ,width + 10, height + 5)
    gCtx.stroke()
}