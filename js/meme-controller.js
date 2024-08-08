'use strict'

let gElCanvas
let gCtx
let gStartPos

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']


function onInit() {
    document.querySelector('.main-editor').style.display = 'none'

    renderImgs()
    gElCanvas = document.querySelector('.main-canvas')
    gCtx = gElCanvas.getContext('2d')

    addListeners()
}

function renderImgs() {
    const elGallery = document.querySelector('.gallery')
    let strHTML = ''
    getImgs().map(({ url, id }) => {
        strHTML += `<img onclick="onSelectImage('${id}')" 
        src="${url}" alt="">
        `
    })

    elGallery.innerHTML = strHTML
}

function onFilterImgs({ target }) {
    console.log(target.value)
    filterImgs(target.value)
    renderImgs()
}

function loadSavedMemes() {
    document.querySelector('.main-editor').style.display = 'none'
    document.querySelector('.main-gallery').classList.add('hidden')
    document.querySelector('.saved-memes').classList.remove('hidden')

    loadMemes()
}

function loadGallery() {
    document.querySelector('.main-editor').style.display = 'none'
    document.querySelector('.main-gallery').classList.remove('hidden')
    document.querySelector('.saved-memes').classList.add('hidden')
}

function onSelectImage(idx) {
    document.querySelector('.main-editor').style.display = 'flex'
    document.querySelector('.main-gallery').classList.add('hidden')
    document.querySelector('.saved-memes').classList.add('hidden')

    const { selectedImgId } = getMeme()
    if (selectedImgId + '' !== idx) resetMeme()

    editMeme('image', idx)
    const elImg = new Image()
    elImg.src = `img/${idx}.jpg`
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
        resizeCanvas()
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
        pos.x *= gElCanvas.width
        pos.y *= gElCanvas.height
        
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

function onUp() {
    setLineDrag(false)
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    addKeyboardListeners()
    window.addEventListener('resize', resizeCanvas)
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

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')

    const containerWidth = elContainer.clientWidth;
    const containerHeight = elContainer.clientHeight;

    gElCanvas.height = containerHeight;
    gElCanvas.width = containerWidth;
    renderMeme()
}

function onKeyboardPress(ev) {
    const elTextBox = document.querySelector('#text-box')
    const elTextSize = document.querySelector('#text-size')
    const elEditor = document.querySelector('.main-editor')
    
    if (elEditor.style.display === 'none') return
    if (ev.target === elTextBox || ev.target === elTextSize) return

    ev.preventDefault()
    switch (ev.code) {
        case 'ArrowRight':
            moveLine(0.01, 0)
            break;
        case 'ArrowLeft':
            moveLine(-0.01, 0)
            break;
        case 'ArrowUp':
            moveLine(0, -0.01)
            break;
        case 'ArrowDown':
            moveLine(0, 0.01)
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
    pos.x /= gElCanvas.width
    pos.y /= gElCanvas.height
    return pos
}

function outlineSelectedLine() {
    let lineSizes = getLineSizes()
    let meme = getMeme()
    if (meme.selectedLineIdx === -1) return
    let { width, height, idx } = lineSizes[meme.selectedLineIdx]
    let { pos } = meme.lines[idx]

    pos.x *= gElCanvas.width
    pos.y *= gElCanvas.height

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

function onSaveMeme() {
    saveMeme()
}

function onLoadMeme(idx) {
    loadMeme(idx)
    const { selectedImgId } = getMeme()
    onSelectImage(selectedImgId)
}