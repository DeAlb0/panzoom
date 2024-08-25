
function addNote(node) {
    let note = document.createElement('div')
    note.classList.add('note')
    note.innerHTML = 'Use mouse wheel to zoom, drag to move'
    node.append(note)
}

const clickOnImg = new Event("imgclick")

function panZoomHandling(obj) {
    const imgContainer = ( obj.parentElement.tagName === 'A' ? obj.parentElement : obj ).parentElement
    const imgChild = 'img,object,svg'
    let isPanning
    let hasMoved = false
    let zoomLevel = 1;
    let img = obj
    let route

    function panZoomReset(pimg,unscaled = false) {
        img = pimg.querySelector('img,object,svg')
        zoomLevel = 1;
        img.style.left = ''
        img.style.top  = ''
        img.style.transform = ''
        img.style.transformOrigin = '0 0';
        if ( pimg.classList.contains('zoomout') ) {
            let bestWidth  = img.naturalWidth  ?? parseInt(img.style.width)  ?? img.width
            let bestHeight = img.naturalHeight ?? parseInt(img.style.height) ?? img.height
            let prescaled = Math.min(1,pimg.clientWidth/bestWidth)
            if ( unscaled ) {
                zoomLevel = Math.max(1,bestWidth/img.parentNode.clientWidth)
            } else {
                zoomLevel = Math.min(img.parentNode.clientWidth/bestWidth, img.naturalWidth ? 1 : 1.5, 
                    img.parentNode.clientHeight/bestHeight)/prescaled
            }
            img.style.left = `${(pimg.clientWidth-img.getBoundingClientRect().width*zoomLevel)/2/pimg.clientWidth*100}%`
            img.style.top  = `${Math.max(0,(pimg.clientHeight-img.getBoundingClientRect().height *zoomLevel)/2/pimg.clientHeight*100)}%`
            img.style.transform = `scale(${zoomLevel})`
        }
        img.classList.remove('panzoomed')
        // img.style.position = 'absolute';
        isPanning = false;
        hasMoved = false
        img.focus() // required to get key events
    }
    function offsetLeft(img) {
        return img.offsetLeft ?? ( img.getBoundingClientRect().x - parseInt(window.getComputedStyle(img.parentElement).getPropertyValue('border-left-width')))
    }
    function offsetTop(img) {
        return img.offsetTop ?? ( img.getBoundingClientRect().y - parseInt(window.getComputedStyle(img.parentElement).getPropertyValue('border-top-width')))
    }
    
    addNote(img.parentNode)
    panZoomReset(imgContainer)
    // imgContainer.setAttribute('preserveAspectRatio','xMidYMid') // works only for svg images
    imgContainer.addEventListener('zoomreset', function(e) {
        panZoomReset(e.currentTarget)
    })

    function zoomImg(img,zoomFactor,x,y) {
        let lastZoomLevel = zoomLevel
        zoomLevel *= zoomFactor
        if ( img.type === 'image/svg+xml' ) {
            x = ( x - offsetLeft(img) ) / lastZoomLevel
            y = ( y - offsetTop(img)  ) / lastZoomLevel
        }
        img.style.left = `${offsetLeft(img) + (lastZoomLevel - zoomLevel) * x}px`
        img.style.top  = `${offsetTop(img)  + (lastZoomLevel - zoomLevel) * y}px`
        img.style.transform = `scale(${zoomLevel})`
        img.classList.add('panzoomed')
    };
    
    imgContainer.addEventListener('wheel', function(e) {
        const zoomStepFactor = 1.1
        if ( e.currentTarget.classList.contains('zoomout') ) {
            e.preventDefault();
            let img = e.currentTarget.querySelector(imgChild)
            let zoomFactor = e.deltaY < 0 ? zoomStepFactor : 1 / zoomStepFactor
            zoomImg(img,zoomFactor,e.offsetX,e.offsetY)
        }
    })
    obj.setAttribute('tabindex','0')
    obj.addEventListener('keydown', function(e) {
        const shiftPx = 20
        let img = e.currentTarget
        function zoomImgCenter(img,zoomFactor) {
            if ( e.currentTarget.parentElement.classList.contains('zoomout') ) {
                e.stopImmediatePropagation()
                let x = (img.parentElement.clientWidth  / 2 - offsetLeft(img) ) / zoomLevel
                let y = (img.parentElement.clientHeight / 2 - offsetTop(img)  ) / zoomLevel
                zoomImg(img,zoomFactor,x,y)
            }
        }
        function move(img,dx,dy) {
            if ( e.currentTarget.parentElement.classList.contains('zoomout') ) {
                e.stopImmediatePropagation()
                e.preventDefault()
                img.style.left = `${offsetLeft(img) + dx}px`
                img.style.top  = `${offsetTop(img)  + dy}px`
                img.classList.add('panzoomed')
            }
        }
        switch ( e.key ) {
            case 'Home': // Fall through to '/'
            case '/' : panZoomReset(img.parentNode,true) ; break
            case '*' : panZoomReset(img.parentNode)      ; break
            case '+' : zoomImgCenter(img,  1.1)  ; break
            case '-' : zoomImgCenter(img,1/1.1)  ; break
            case 'ArrowLeft'  : move(img,+shiftPx,0) ; break
            case 'ArrowRight' : move(img,-shiftPx,0) ; break
            case 'ArrowUp'    : move(img,0,+shiftPx) ; break
            case 'ArrowDown'  : move(img,0,-shiftPx) ; break
            case 'Enter' :
                    e.currentTarget.parentElement.dispatchEvent(clickOnImg);
                    break
            }
        })

    imgContainer.onmousedown = function(e){
        if ( e.button === 0 ) {
            let img = e.currentTarget.querySelector(imgChild)
            isPanning = e.currentTarget.classList.contains('zoomout')
            if ( isPanning) {
                e.preventDefault();
            }
            startX = e.clientX - offsetLeft(img)
            startY = e.clientY - offsetTop(img)
            route = 0
            hasMoved = false
        }
    }
    imgContainer.onmousemove = function(e){
        if (isPanning){
            let img = e.currentTarget.querySelector(imgChild)
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            const dx = x - ( img.offsetLeft ?? ( img.getBoundingClientRect().x - parseInt(window.getComputedStyle(img.parentElement).getPropertyValue('border-left-width'))) )
            const dy = y - ( img.offsetTop ?? ( img.getBoundingClientRect().y - parseInt(window.getComputedStyle(img.parentElement).getPropertyValue('border-top-width'))) )
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
            route += dx*dx + dy*dy
            if ( route > 4 ) hasMoved = true
            if ( hasMoved ) {
                e.currentTarget.style.cursor = 'grabbing'
                img.classList.add('panzoomed')
            }
        }
    }
    imgContainer.onmouseup = function(e){
        if (isPanning){ 
            isPanning = false;
            e.currentTarget.style.cursor = ''
        }
        if ( e.button === 0 && ! hasMoved ) {
            e.currentTarget.dispatchEvent(clickOnImg);
        }
    }
    imgContainer.onmouseleave = function(e){
        isPanning = false;
        e.currentTarget.style.cursor = ''
    }
}

const zoomReset = new Event("zoomreset")

function classSwitcher(ele,classname) {
    let toSet = ! ele.classList.contains(classname)
    for ( setEle of document.getElementsByClassName(classname) ) {
        setEle.classList.remove(classname)
    }
    ele.classList.toggle(classname,toSet)
    ele.dispatchEvent(zoomReset);
}

function bigImageFilter(img) {
    let select = ( img.naturalWidth ?? img.width.baseVal?.value ?? parseInt(img.style.width) ) > img.parentNode.clientWidth * 0.5
    return select
}

const imgSelector = '.plantuml>object,.plantuml>img,figure>img,.plantuml>svg'

async function panZoomInstrument() {
    // sphinx uml command with attributes set generates img inside 'a', when png output is configured
    // This 'a' is removed here to simplify zoom handling. Then the parent is alyway the container
    for ( anchor of document.querySelectorAll('.plantuml a:has(img)')) {
        anchor.parentElement.append(anchor.children[0])
        anchor.remove()
    }
    for ( obj of document.querySelectorAll(imgSelector)) {
        if ( bigImageFilter(obj) ) {
            let img = obj
            // objects refering to svg's are replaced by the svg content
            // only then links can be accessed and mouse events can be used for pan/zoom
            if ( obj.type === 'image/svg+xml' ) {
                const svgurl = obj.data
                const response = await fetch(svgurl).catch(error => console.error(error.message + " " + svgurl));
                if (response?.ok ) {
                    const svgtext = await response.text()
                    const svgContainer = obj.parentNode
                    svgContainer.innerHTML = svgtext.replace(/^<\?xml[^>]+>/,'')
                    img = svgContainer.querySelector('svg')
                    for ( anchor of img.querySelectorAll('A')) {
                        anchor.href.baseVal = new URL(anchor.href.baseVal,svgurl).href // adjust href which was relative to svg file
                    }
                } else {
                    console.error(response)
                    console.log('continueing without svg inlining => links will not work')
                }
            }
            img.parentElement.addEventListener('imgclick', function(evt) {
                classSwitcher(evt.currentTarget,'zoomout')
            })
            img.parentElement.classList.add('zoomoutParent')
            panZoomHandling(img)
        }
    }
    document.addEventListener('keydown', function(evt) {
        if ( evt.key === 'Escape' ) {
            for ( ele of document.getElementsByClassName('zoomout') ) {
                    classSwitcher(ele,'zoomout')
            }
        }
    })
}

addEventListener('load',panZoomInstrument)
