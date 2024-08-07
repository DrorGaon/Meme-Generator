'use strict'

let gElCanvas
let gCtx
let gStartPos

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']


function onInit() {
    document.querySelector('.main-editor').style.display = 'none'
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
    document.querySelector('.main-editor').style.display = 'none'
    document.querySelector('.main-gallery').classList.remove('hidden')
}

function onSelectImage(idx) {
    document.querySelector('.main-editor').style.display = 'flex'
    document.querySelector('.main-gallery').classList.add('hidden')

    editMeme('image', idx)
    const elImg = new Image()
    elImg.src = `img/${idx}.jpg`
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
        renderMeme()
    }
}

function renderMeme() {
    const meme = getMeme()
    const { lines } = meme
    const elImg = new Image()
    elImg.src = `img/${meme.selectedImgId}.jpg`
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
    if (!lines.length) return

    lines.forEach(line => {
        let { text, color, outline, size, pos, font } = line
        if (!text) {
            text = 'Sample text'
            editMeme('text', text)
        }

        gCtx.beginPath()
        gCtx.lineWidth = 2
        gCtx.strokeStyle = outline
        gCtx.fillStyle = color
        gCtx.font = `${size}px ${font}`
        gCtx.textAlign = 'center'
        gCtx.textBaseline = 'middle'

        gCtx.fillText(text, pos.x, pos.y)
        gCtx.strokeText(text, pos.x, pos.y)
    })

    outlineSelectedLine()
    renderMemeValues()
}

function onChangeColor({ target }) {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    document.querySelector('.text-color').style.color = target.value
    editMeme(target.id, target.value)
    renderMeme()
}

function editText({ target }) {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    editMeme('text', target.value)
    renderMeme()
}

function downloadImg(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg') // image/jpeg the default format
    elLink.href = imgContent
}

function onTextSizeChange(elInput) {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    let { value } = elInput
    if (!value) {
        if (elInput.innerText === "-") editMeme('decrease')
        else editMeme('increase')
    } else editMeme('text-size', value)
    renderMeme()
}

function onSwitchLine() {
    let { selectedLineIdx: idx, lines } = getMeme()
    idx += 1
    if (idx === lines.length) idx = 0
    setSelectedLine(idx)
    renderMeme()
}

function onAddLine() {
    addLine()
    renderMeme()
}

function onDeleteLine() {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    deleteLine()
    renderMeme()
}

function onChangeFont({ target }) {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    editMeme('font', target.value)
    renderMeme()
}

function onAlignText(direction) {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    alignText(direction)
    renderMeme()
}

function onDown(ev) {
    const pos = getEvPos(ev)
    const res = isLineClicked(pos)
    if (!res.isClicked) {
        setSelectedLine(-1)
        renderMeme()
        return
    }

    setSelectedLine(res.idx)
    renderMeme()
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
    addKeyboardListeners()
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

function addKeyboardListeners() {
    window.addEventListener('keydown', onKeyboardPress)
}

function onKeyboardPress(ev) {
    const elTextBox = document.querySelector('#text-box')
    const elTextSize = document.querySelector('#text-size')
    const elGallery = document.querySelector('.main-gallery')
    
    if(!elGallery.classList.contains('hidden')) return
    if(ev.target === elTextBox || ev.target === elTextSize) return

    ev.preventDefault()
    switch (ev.code) {
        case 'ArrowRight':
            moveLine(5, 0)
            break;    
        case 'ArrowLeft':
            moveLine(-5, 0)
            break;    
        case 'ArrowUp':
            moveLine(0, -5)
            break;    
        case 'ArrowDown':
            moveLine(0, 5)
            break;    
    }
    renderMeme()
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

function outlineSelectedLine() {
    let lineSizes = getLineSizes()
    let meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    let { width, height, idx } = lineSizes[meme.selectedLineIdx]
    let { pos } = meme.lines[idx]

    gCtx.beginPath()
    gCtx.setLineDash([10, 10])
    gCtx.strokeStyle = 'red'
    gCtx.roundRect((pos.x - width / 2) - 5, (pos.y - height / 2) - 5, width + 10, height + 5, 7)
    gCtx.stroke()
    gCtx.setLineDash([])
}

function renderMemeValues() {
    const meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    const { lines } = meme
    const selectedLine = lines[meme.selectedLineIdx]

    document.querySelector('#text-size').value = selectedLine.size
    const elTextBox = document.querySelector('#text-box')
    const placeholder = selectedLine.text
    if (placeholder === 'Sample text') elTextBox.value = ''
    else elTextBox.value = placeholder

    const elTextColor = document.querySelector('.text-color')
    elTextColor.style.color = selectedLine.color

    const elTextOutline = document.querySelector('.text-outline')
    elTextOutline.style.color = selectedLine.outline
}