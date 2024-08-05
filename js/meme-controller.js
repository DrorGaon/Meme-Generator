let gElCanvas
let gCtx

function onInit(){
    const elGallery = document.querySelector('.gallery')
    let strHTML = ''
    for(let i = 1; i <= 18; i++){
        strHTML += `
        <img onclick="onSelectImage('${i}')" 
        src="img/${i}.jpg" alt="">
        `
    }
    elGallery.innerHTML = strHTML

    gElCanvas = document.querySelector('.main-canvas')
    gCtx = gElCanvas.getContext('2d')
}

function onSelectImage(idx){
    document.querySelector('.main-editor').classList.remove('hidden')
    document.querySelector('.main-gallery').classList.add('hidden')

    const elImg = new Image()
    elImg.src = `img/${idx}.jpg`
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
}