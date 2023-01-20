class Slides {
  constructor() {
    this.slides = []; // array to hold the slide elements
    this.currentSlideIndex = 0; // keep track of the current slide
    this.baseUrl = 'https://floaties.s3.amazonaws.com/img/'
    this.isPlaying = false // flag to indicate if the slideshow is playing
  }

  // create an individual slide from image data
  createSlide(data) {
    const img = document.createElement("img");
    img.setAttribute("src", `${this.baseUrl}${data.name}`);
    if(data.name.includes("svg")) {
      img.setAttribute('width', '1200px')
    } 
    img.setAttribute("sizes", "(min-width: 800px) 50vw, 100vw")
    const div = document.createElement("div");
    div.classList.add("slides");
    div.appendChild(img);
    return div;
  }

  // render the slides to the DOM
  renderSlides(imgData) {
    const slideshowContainer = document.querySelector(".slideshow-container");
    slideshowContainer.replaceChildren();

    imgData.forEach((img) => {
        const slide = this.createSlide(img);
        slideshowContainer.appendChild(slide);
    });
  }

  // move to the next or previous slide
  navigateSlides(direction) {
    this.showSlides(direction);
  }
  
  // set the current slide index
  setSlideIndex(newIndex = 0) {
    this.currentSlideIndex = newIndex
  }

  // show the current slide and hide all other slides
  showSlides(direction = 0) {
    this.slides = this.getSlidesElement() // load our slides into the global object
    let slides = this.slides;
    let newIndex = this.currentSlideIndex + direction;
    this.albumLength = slides.length
    this.currentSlideIndex = newIndex < 0 ? slides.length - 1 : newIndex % slides.length;

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    if(this.isPlaying) {
      slides[this.currentSlideIndex].classList.add('fade')
    } else {
      slides[this.currentSlideIndex].classList.remove('fade')
    }
    slides[this.currentSlideIndex].style.display = "block";
  }

  // return the slide element from the DOM
  getSlidesElement() {
    return document.getElementsByClassName("slides")
  }
}

class Album {
  constructor(data) {
    this.title = data.title;
    this.tags = data.tags;
    this.attributions = data.attributions;
    this.titleAttr = data.attributions.title_attr
    this.worksAttr = data.attributions.works_attr;
    this.link = data.link;
    this.images = data.images;
    this.template = data.content_template
    this.albumLength = 0 // we set this in extractImageData
    this.albumIndex = 0
  }

  // render the album and update the display of the album's data
  loadAlbum(albumIndex) {
    this.updateAlbumDataDisplay()
    this.getImageDataForRendering()
    this.albumIndex = albumIndex
  }

  // extract image references from the content template
  extractImageReferences(contentTemplate) {
    const re = /{.*}/g
    const editedTemplate = contentTemplate.replaceAll('}{', '}\n{')
    return editedTemplate.match(re)
  }
  
  // remove the scale value from the image reference
  removeScale(imageReference) {
    if (imageReference.includes('scale')) {
      const ix = imageReference.search(' scale')
      return imageReference.slice(0, ix) + '}'
    } else {
      return imageReference
    }
  }
  
  // extract image data from the template
  extractImageData(contentTemplate, images) {
    const imageReferences = this.extractImageReferences(contentTemplate)
    const cleanedReferences = imageReferences.map(this.removeScale)
    const imageLookup = images.reduce((obj, cur) => (
      { ...obj, [cur.image_ref]: {"name": cur.name}}), {})
  
    return cleanedReferences.map(ref => imageLookup[ref])
  }

  // clean the formatting in the attribution field
  cleanAttribution(attribution) {
    const re = /by([^\s:])/
    const matches = attribution.match(re)
    if(matches) {
      attribution = attribution.replace(' by', ' by ')
    }

    return attribution
  }

  // format album data into an HTML string, then parse into DOM element
  formatAlbumData(title, titleAttr, worksAttr, tags, link) {
    let albumData = `<div>`;
    albumData += `<p class="album-title">${title}</p>`;
    if (titleAttr.length > 0) {
      albumData += `<p><i>- ${titleAttr}</i></p>`;
    }
    if (worksAttr.length > 0) {
      albumData += `<br/><p>${worksAttr}</p>`;
    }
    albumData += `<br/><br/><div class="tags">${tags}</div>`;
    albumData += `<br/><div><a href=${link}>Link</a></div>`;
    albumData += `<br/></div>`;
    return htmlToElement(albumData);
  }

  // get album fields from an album
  getAlbumData(album) {
    this.title = album.title;
    this.tags = album.tags;
    this.attributions = album.attributions;
    this.titleAttr = album.attributions.title_attr
    this.worksAttr = this.cleanAttribution(album.attributions.works_attr);
    this.link = album.link;
    this.images = album.images;
    this.template = album.content_template         
  }

  // update the album data on screen
  updateAlbumDataDisplay() {
    const albumDataContainer = document.getElementsByClassName("album-data")[0];
    albumDataContainer.replaceChildren();
    const albumData = this.formatAlbumData(this.title, this.titleAttr, this.worksAttr, this.tags, this.link);
    albumDataContainer.appendChild(albumData);
  }

  // get image data for rendering
  getImageDataForRendering() {
    const imageData = this.extractImageData(this.template, this.images)
    this.albumLength = imageData.length
    return imageData
  }
}

class Slideshow {
  constructor(floaties) {
    this.slideIndex = 0;
    this.albumCollection = floaties; // array of albums
    this.randomAlbums = this.shuffleIndexes(this.albumCollection); // [7, 4, 1, etc.] values correspond to place in albumCollection
    this.randomAlbumsIx = 0; // pointer to current place in randomAlbums
    this.isPlaying = false;
    this.playMode = ""
    this.slides = new Slides();
    this.album = new Album(this.albumCollection[0])
    this.timeOutId = 0
  }

  // fisher-yates shuffle
  shuffle(arr) {
    let i = arr.length
    let j = 0
    let temp = {}

    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
  }

  // use fisher-yates to shuffle indexes of a given array
  shuffleIndexes(arr) {
    let indexes = arr.map( (e,i) => i)
    return this.shuffle(indexes)
  }

  // move to next or previous album
  navigateAlbum(direction = 0) {
    let newIndex = this.album.albumIndex + direction;
    this.album.albumIndex = newIndex < 0 ? this.albumCollection.length - 1 : newIndex % this.albumCollection.length;
    this.loadAlbum(this.album.albumIndex)
    this.displaySlides()
    this.updateAlbumCounter()
  }

  // gets album data and loads it into the state
  loadAlbum(albumIndex = 0) {
    this.album.getAlbumData(this.albumCollection[albumIndex])
    this.album.loadAlbum(albumIndex)
    this.updateAlbumCounter()
  }

  // renders the slides from the album, shows current slide and counter
  displaySlides(slideIndex = 0) {
    this.slides.renderSlides(this.album.getImageDataForRendering())
    this.slides.setSlideIndex(slideIndex)
    this.slides.showSlides()
    this.updateSlidesCounter(this.slides.currentSlideIndex, this.slides.slides.length)
  }

  // navigate next/previous slide
  navigateSlides(direction = 0) {
    this.slides.navigateSlides(direction);
    this.updateSlidesCounter(this.slides.currentSlideIndex, this.slides.slides.length)

  }

  // update album counter
  updateAlbumCounter(){
    const albumCounterDiv = document.getElementsByClassName("album-counter")[0]
    albumCounterDiv.innerHTML = `${this.album.albumIndex + 1} / ${this.albumCollection.length}<br /><br />`
  }

  // update slide counter
  updateSlidesCounter(){
    const slideCounterDiv = document.getElementsByClassName("slide-counter")[0]
    slideCounterDiv.innerHTML = `${this.slides.currentSlideIndex + 1} / ${this.slides.slides.length}`
  }

  // sets state variables before playing, resets them when paused
  playSlideshow(playbackOption) {
    const isPlaying = !this.isPlaying;
    this.isPlaying = isPlaying;
    this.slides.isPlaying = this.isPlaying
    this.playMode = playbackOption

    if(this.isPlaying) {
        this.playSlides(playbackOption);
    } else {
      clearTimeout(this.timeOutId)
      this.playMode = ""

      if (this.slides.currentSlideIndex == this.slides.slides.length) {
        this.slides.currentSlideIndex -= 1
      }
      this.slides.getSlidesElement()[this.slides.currentSlideIndex].classList.remove('fade')
      if(playbackOption != 'random'){
        this.slides.showSlides(-1)
      }
    }
    this.toggleNavigation(playbackOption);
  }

  // main slideshow loop
  playSlides() {
    if(this.isPlaying) {
      this.timeOutId = setTimeout(() => this.playSlides(this.playMode), 9000)
    
      if(this.playMode == 'set') {
        this.playImageSet()
      } else if(this.playMode == 'all') {
        this.playAllSets()
      } else if(this.playMode = 'random') {
        this.playRandomImages()
      }
    }
  }

  // play through the entire collection
  playAllSets() {
      if (this.slides.currentSlideIndex == this.album.albumLength) {
        this.album.albumIndex += 1
        this.album.albumIndex = this.album.albumIndex == this.albumCollection.length ? 0 : this.album.albumIndex;

        this.album.getAlbumData(this.albumCollection[this.album.albumIndex])
        this.album.loadAlbum(this.album.albumIndex)
        this.updateAlbumCounter()
        this.displaySlides()
      }
      this.playImageSet()
  }
  
  // slideshow of random images
  playRandomImages() {
    this.getRandomAlbum()
    let randomImageIx = this.shuffleIndexes(this.albumCollection[this.album.albumIndex]['images'])[0]
    this.displaySlides(randomImageIx)
    this.randomAlbumsIx += 1
  }

  // loop through a set
  playImageSet() {
      this.displaySlides(this.slides.currentSlideIndex)
      this.slides.setSlideIndex(this.slides.currentSlideIndex + 1)
  }

  // gets a random album's data and loads it
  getRandomAlbum() {
    this.album.albumIndex = this.randomAlbums[this.randomAlbumsIx]
    this.album.getAlbumData(this.albumCollection[this.album.albumIndex])
    this.album.loadAlbum(this.album.albumIndex)
    this.updateAlbumCounter()
    this.randomAlbumsIx += 1
  }

  // shows a random album 
  randomAlbum() {
    this.getRandomAlbum()
    this.displaySlides()
  }

  // turn navigation on or off when the slideshow is playing
  toggleNavigation(currentPlayBackOption = "") {
    const slideNavigation = document.querySelector(".slide-navigation-container")
    const albumNavigation = document.querySelector(".album-navigation")

    slideNavigation.classList.toggle("disable");
    albumNavigation.classList.toggle("disable");

    const elements = {
      set: document.getElementById('play-set'),
      all: document.getElementById('play-all'),
      random: document.getElementById('play-random')
    }

    Object.keys(elements).forEach(key => {
      if (key !== currentPlayBackOption) {
          elements[key].classList.toggle("disable");
      }
    });
  }
}


function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.children[0];
}

async function fetchAllData() {
  const response = await fetch("https://floaties.s3.us-west-1.amazonaws.com/floaties.json");
  const data = await response.json();
  return data.reverse()
}

async function loadFunctionality() {
  const data = await fetchAllData()
  const slideshow = new Slideshow(data)

  const prevSlide = document.getElementById('prev-slide');
  prevSlide.addEventListener('click', () => slideshow.navigateSlides(-1), false );

  const nextSlide = document.getElementById('next-slide')
  nextSlide.addEventListener('click', () => slideshow.navigateSlides(1), false )

  const prevAlbum = document.getElementById('prev-album')
  prevAlbum.addEventListener('click', () => slideshow.navigateAlbum(-1), false )

  const randomAlbum = document.getElementById('random-album')
  randomAlbum.addEventListener('click', () => slideshow.randomAlbum(), false )

  const nextAlbum = document.getElementById('next-album')
  nextAlbum.addEventListener('click', () => slideshow.navigateAlbum(1), false )

  const playSet = document.getElementById('play-set')
  playSet.addEventListener('click', () => slideshow.playSlideshow("set"), false )

  const playAll = document.getElementById('play-all')
  playAll.addEventListener('click', () => slideshow.playSlideshow("all"), false )

  const playRandom = document.getElementById('play-random')
  playRandom.addEventListener('click', () => slideshow.playSlideshow("random"), false )

  slideshow.loadAlbum()
  slideshow.displaySlides()
}

loadFunctionality()