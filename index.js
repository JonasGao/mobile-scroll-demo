const getElementById = document.getElementById.bind(document)
const createElement = document.createElement.bind(document)
const querySelector = document.querySelector.bind(document)

window.addEventListener('load', function () {
  const list = getElementById('list')
  const wrapper = querySelector('.wrapper')

  initTouchScroll()
  appendLis()
  disableNativeMove(querySelector('.main'))
  disableNativeMove(document.body)

  function initTouchScroll () {
    let touching = false
    let start = null
    let lastY = 0
    let currY = 0
    let lastStamp = null
    let s = 0
    let last = null
    let transitionCleaner = null
    let lastMomentumStamp = null

    wrapper.addEventListener('touchstart', function (event) {
      touching = true
      last = start = event.changedTouches[0]
      lastStamp = lastMomentumStamp = new Date().getTime()
      if (transitionCleaner) {
        clearTimeout(transitionCleaner)
        list.style.transition = null
        transitionCleaner = null
        const computedTransform = getComputedStyle(list).transform.split(')')[0].split(', ')
        lastY = +(computedTransform[13] || computedTransform[5])
        list.style.transform = `translateY(${lastY}px)`
      }
    }, { passive: true })

    wrapper.addEventListener('touchmove', function (event) {
      if (touching) {
        const curr = event.changedTouches[0]
        currY = lastY + curr.clientY - start.clientY

        const currStamp = new Date().getTime()
        const span = currStamp - lastMomentumStamp

        lastStamp = currStamp

        if (span > 300) {
          s = Math.abs(curr.clientY - last.clientY) / span
          last = curr
          lastMomentumStamp = currStamp
        }

        requestAnimationFrame(function () {
          list.style.transform = `translateY(${currY}px)`
        })
      }
    }, { passive: true })

    wrapper.addEventListener('touchend', function (event) {
      const curr = event.changedTouches[0]
      currY = lastY + curr.clientY - start.clientY

      const currStamp = new Date().getTime()
      const span = currStamp - lastMomentumStamp

      if (span > 0 && currStamp - lastStamp < 50) {
        const distance = curr.clientY - last.clientY
        s = Math.abs(distance) / span
        if (s > 0) {
          currY = s * 500 * (distance < 0 ? -1 : 1) + currY
          requestAnimationFrame(function () {
            list.style.transform = `translateY(${currY}px)`
            list.style.transition = 'transform 500ms cubic-bezier(0.165, 0.84, 0.44, 1)'
            transitionCleaner = setTimeout(function () {
              list.style.transition = null
              transitionCleaner = null
            }, 500)
          })
        }
      }

      last = null
      lastStamp = null
      lastMomentumStamp = null
      touching = false
      start = null
      lastY = currY
    }, { passive: true })
  }

  function appendLis () {
    const liArray = []

    for (var i = 0; i < 500; i++) {
      const li = createElement('li')
      li.innerHTML = 'LI ' + i
      li.addEventListener('click', function () {
        console.log('clicking', li.innerHTML)
      })
      liArray.push(li)
    }

    requestAnimationFrame(function () {
      liArray.forEach(function (li) {
        list.appendChild(li)
      })
    })
  }

  function disableNativeMove (elem) {
    elem.addEventListener('touchmove', function (event) {
      event.preventDefault()
      event.stopPropagation()
    }, false)
  }
})
