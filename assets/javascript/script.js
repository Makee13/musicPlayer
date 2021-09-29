const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = "player"

const AUDIO = $('audio')
const SONGS_MENU = $('.container__songs-list__menu')
const CD = $('.container__play-path__plate__main img')
const PLAY_BUTTON = $('button.playMusic')
const PREV_BUTTON = $('button.prevSong')
const NEXT_BUTTON = $('button.nextSong')
const RANDOM_BUTTON = $('button.randomSong')
const REPEAT_BUTTON = $('button.repeatSong')
const PROGRESS_BAR = $('#progress')

// let data = []

var songs = []

const APP = {

    isRandom: false,
    isPlaying: false,
    isRepeat: false,
    isRender: false,
    currentValue: 0,

    // Render data
    renderData: function(renderedData) {
        if (renderedData) {
            isRender = true
            var html = ''
            renderedData.forEach((element, index) => {
                html += `<li class="container__songs-list__menu__item active-item${index}" data-index = "${index}">
                            <div class="container__songs-list__menu__item__img">
                                <img src="${element.image}" alt="">
                            </div>
                            <div class="container__songs-list__menu__item__des">
                                <div class="container__songs-list__menu__item__des__song-name">${element.name}</div>
                                <div class="container__songs-list__menu__item__des__singer">${element.singer}</div>
                            </div>
                            <div class="container__songs-list__menu__item__read-more">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </li>`
            })
    
            SONGS_MENU.innerHTML = html
            songs = renderedData
            APP.loadCurrentSong()
        } else {
            alert("Not found data")
        }
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return songs[this.currentValue]
            }
        })
    },

    handleEvent: function () {
        const THIS_APP = this
        
        // Xử lý tăng giảm ảnh chính khi scroll
        const cdWidth = CD.offsetWidth
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            CD.style.width = newCdWidth < 0 ? 0 : newCdWidth + "px"
            CD.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý xoay CD
        var cdAnimate = CD.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdAnimate.pause()

        //Xử lý khi play bài hát thì chạy thanh progress bar
        AUDIO.ontimeupdate = function () {
            PROGRESS_BAR.value = ((AUDIO.currentTime / AUDIO.duration) * 100)
            if (PROGRESS_BAR.value >= 100) {
                if (THIS_APP.isRepeat) {
                    PROGRESS_BAR.value = 0
                    AUDIO.currentTime = 0
                    console.log(AUDIO.currentTime)
                } else {
                    nextSong()
                }
            }
        }

        PROGRESS_BAR.onchange = function (e) {
            PROGRESS_BAR.value = e.target.value
            AUDIO.currentTime = (PROGRESS_BAR.value / 100) * AUDIO.duration
        }

        // Khi song được play
        AUDIO.onplay = function () {
            PLAY_BUTTON.classList.add('playing')
            THIS_APP.isPlaying = true
            cdAnimate.play()
        }

        // Khi pause song
        AUDIO.onpause = function () {
            PLAY_BUTTON.classList.remove('playing')
            THIS_APP.isPlaying = false
            cdAnimate.pause()
        }

        function activeSong() {
            const ACTIVED_SONG = $('.container__songs-list__menu .active')
            if (ACTIVED_SONG) {
                ACTIVED_SONG.classList.remove('active')
            }
            $(`.container__songs-list__menu .active-item${THIS_APP.currentValue}`).classList.add('active')
        }

        function playMusic() {
            if (THIS_APP.isPlaying) {
                AUDIO.pause()
            } else {
                AUDIO.play()
            }
            activeSong()
        }

        function repeatSong() {
            if (!THIS_APP.isRepeat) {
                REPEAT_BUTTON.classList.add('repeatActive')
                THIS_APP.isRepeat = true
            } else {
                REPEAT_BUTTON.classList.remove('repeatActive')
                THIS_APP.isRepeat = false
            }
        }

        function prevSong() {
            THIS_APP.isPlaying = false
            if (THIS_APP.isRandom) {
                getRandomCurrentValue(songs.length)
            } else {
                THIS_APP.currentValue--
                if (THIS_APP.currentValue < 0)
                    THIS_APP.currentValue = songs.length - 1
            }
            THIS_APP.loadCurrentSong()
            playMusic()
            scrollIntoView()
        }

        function nextSong() {
            THIS_APP.isPlaying = false
            if (THIS_APP.isRandom) {
                getRandomCurrentValue()
            } else {
                THIS_APP.currentValue++
                if (THIS_APP.currentValue === songs.length)
                    THIS_APP.currentValue = 0
            }
            THIS_APP.loadCurrentSong()
            playMusic()
            scrollIntoView()
        }

        // Lấy số random gán vào biến bước nhảy của bài hát
        let randomArray = []
        function getRandomCurrentValue() {
            if (randomArray.length === songs.length) {
                randomArray = []
            }
            const RANDOM_VALUE = checkRandom(Math.floor(Math.random() * songs.length))
            THIS_APP.currentValue = RANDOM_VALUE === 0 ? RANDOM_VALUE : RANDOM_VALUE - 1
        }

        // Kiểm tra và trả về random number không lặp lại số trước đó
        function checkRandom(RANDOM_VALUE) {
            if (!randomArray.includes(RANDOM_VALUE)) {
                randomArray.push(RANDOM_VALUE)
                return RANDOM_VALUE
            } else {
                return checkRandom(Math.floor(Math.random() * songs.length))
            }
        }
        
        function randomSong() {
            if (!THIS_APP.isRandom) {
                RANDOM_BUTTON.classList.add('randomActive')
                THIS_APP.isRandom = true
            } else {
                RANDOM_BUTTON.classList.remove('randomActive')
                THIS_APP.isRandom = false
            }
        }

        function scrollIntoView() {
            const ACTIVED_SONG = $('.container__songs-list__menu .active')
            setTimeout(function () {
                ACTIVED_SONG.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }, 300)
        }

        function clickToActiveSong(e) {
            const OPTION_SONG = e.target.closest('.container__songs-list__menu__item__read-more')
            const CLICKING_SONG = e.target.closest(`.container__songs-list__menu__item:not(.container__songs-list__menu .active)`)
            if(CLICKING_SONG && !OPTION_SONG) {
                const CLICKING_SONG_INDEX = Number(CLICKING_SONG.dataset.index)
                THIS_APP.currentValue = (CLICKING_SONG_INDEX != null) ? CLICKING_SONG_INDEX : THIS_APP.currentValue
                THIS_APP.isPlaying = false
                THIS_APP.loadCurrentSong()
                playMusic()
            }
            if(OPTION_SONG) {
                console.log('option')
            }
        }

        REPEAT_BUTTON.onclick = repeatSong
        PREV_BUTTON.onclick = prevSong
        PLAY_BUTTON.onclick = playMusic
        NEXT_BUTTON.onclick = nextSong
        RANDOM_BUTTON.onclick = randomSong
        SONGS_MENU.onclick = clickToActiveSong

    },

    // Xử lý load những đặc điểm của bài hát hiện tại lên UI
    loadCurrentSong: function () {
        const NAME = $('.container__play-path__plate h2')
        NAME.innerText = this.currentSong.name
        CD.src = this.currentSong.image
        AUDIO.src = this.currentSong.link
    },

    start: function() {
        this.defineProperties()

        // Load data
        fetch('http://localhost:3000/music')
        .then(function (response) {
            return response.json()
        })
        .then(this.renderData)
        .catch(function (error) {})

        // Hàm xử lý sự kiện
        this.handleEvent()
    }
}

APP.start()




