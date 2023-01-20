class Slides {
  constructor() {
    this.slides = [];
    this.currentSlideIndex = 0;
    this.baseUrl = 'https://floaties.s3.amazonaws.com/img/'
    this.isPlaying = false
  }

  // create an individual slide from image data
  createSlide(data) {
    const img = document.createElement("img");
    img.setAttribute("src", `${this.baseUrl}${data.name}`);
    const div = document.createElement("div");
    div.classList.add("slides");
    div.appendChild(img);
    return div;
  }

  renderSlides(imgData) {
    const slideshowContainer = document.querySelector(".slideshow-container");
    slideshowContainer.replaceChildren();

    imgData.forEach((img) => {
        const slide = this.createSlide(img);
        slideshowContainer.appendChild(slide);
    });
  }

  navigateSlides(direction) {
    this.showSlides(direction);
  }

  setSlideIndex(newIndex = 0) {
    this.currentSlideIndex = newIndex
  }

  showSlides(direction = 0) {
    this.slides = this.getSlidesElement()
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
    // this.showFraction(this.currentSlideIndex, slides.length)
  }

  getSlidesElement() {
    return document.getElementsByClassName("slides")
  }

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

  shuffleIndexes(arr) {
    let indexes = arr.map( (e,i) => i)
    return this.shuffle(indexes)
  }

  showFraction(num, denom){
    const slideFractionDiv = document.getElementsByClassName("slide-fraction")[0]
    slideFractionDiv.innerHTML = `${num + 1} / ${denom}`
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
    this.timeOutId = 0
  }

  loadAlbum() {
    this.updateAlbumDataDisplay()
    this.renderImages()
  }

  extractImageReferences(contentTemplate) {
    const re = /{.*}/g
    const editedTemplate = contentTemplate.replaceAll('}{', '}\n{')
    return editedTemplate.match(re)
  }
  
  removeScale(imageReference) {
    if (imageReference.includes('scale')) {
      const ix = imageReference.search(' scale')
      return imageReference.slice(0, ix) + '}'
    } else {
      return imageReference
    }
  }
  
  extractImageData(contentTemplate, images) {
    const imageReferences = this.extractImageReferences(contentTemplate)
    const cleanedReferences = imageReferences.map(this.removeScale)
    const imageLookup = images.reduce((obj, cur) => (
      { ...obj, [cur.image_ref]: {"name": cur.name}}), {})
  
    return cleanedReferences.map(ref => imageLookup[ref])
  }

  cleanAttribution(attribution) {
    const re = /by([^\s:])/
    const matches = attribution.match(re)
    if(matches) {
      attribution = attribution.replace(' by', ' by ')
    }

    return attribution
  }

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

  updateAlbumDataDisplay() {
    const albumDataContainer = document.getElementsByClassName("album-data")[0];
    albumDataContainer.replaceChildren();
    const albumData = this.formatAlbumData(this.title, this.titleAttr, this.worksAttr, this.tags, this.link);
    albumDataContainer.appendChild(albumData);
    // this.showFraction(this.albumIndex, this.totalAlbums)
  }

  renderImages() {
    const imageData = this.extractImageData(this.template, this.images)
    this.albumLength = imageData.length
    return imageData
  }

  showFraction(num, denom){
    const albumFractionDiv = document.getElementsByClassName("album-fraction")[0]
    albumFractionDiv.innerHTML = `${num + 1} / ${denom}<br /><br />`
  }
}

class Slideshow {
  constructor(floaties) {
    this.albumIndex = 0;
    this.slideIndex = 0;
    this.albumCollection = floaties; // array of albums
    this.randomAlbums = this.shuffleIndexes(this.albumCollection); // [7, 4, 1, etc.] values correspond to place in albumCollection
    this.randomAlbumsIx = 0; // pointer to current place in randomAlbums
    this.isPlaying = false;
    this.playMode = ""
    this.slides = new Slides();
    this.album = new Album(this.albumCollection[0])
  }

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

  shuffleIndexes(arr) {
    let indexes = arr.map( (e,i) => i)
    return this.shuffle(indexes)
  }

  navigateAlbum(direction = 0) {
    let newIndex = this.albumIndex + direction;
    this.albumIndex = newIndex < 0 ? this.albumCollection.length - 1 : newIndex % this.albumCollection.length;
    this.loadAlbum(this.albumIndex)
    this.displaySlides()
  }

  loadAlbum(albumIndex = 0) {
    this.album.getAlbumData(this.albumCollection[albumIndex])
    this.album.loadAlbum()
  }

  displaySlides(slideIndex = 0) {
    this.slides.renderSlides(this.album.renderImages())
    this.slides.setSlideIndex(slideIndex)
    this.slides.showSlides()
  }

  navigateSlides(direction = 0) {
    this.slides.navigateSlides(direction);
  }

  playSlideshow(playbackOption) {
    const isPlaying = !this.isPlaying;
    this.isPlaying = isPlaying;
    this.slides.isPlaying = this.isPlaying
    this.playMode = playbackOption

    if(this.isPlaying) {
        this.playSlides(playbackOption);
        // console.log(this.slides.getSlidesElement()[this.slides.currentSlideIndex].classList)
    } else {
        this.playMode = ""
        // console.log(this.slides.getSlidesElement()[this.slides.currentSlideIndex].classList)
        this.slides.getSlidesElement()[this.slides.currentSlideIndex].classList.remove('fade')
        if(playbackOption != 'random'){
          this.slides.showSlides(-1)
        }
        clearTimeout(this.timeOutId)
    }
    this.toggleNavigation(playbackOption);
  }


  playSlides() {
    if(this.isPlaying) {
      this.timeOutId = setTimeout(() => this.playSlides(this.playMode), 6000)
    
      if(this.playMode == 'set') {
        this.playImageSet()
      } else if(this.playMode == 'all') {
        this.playAllSets()
      } else if(this.playMode = 'random') {
        this.playRandomImages()
      }
    }
  }

  playAllSets() {
      if (this.slides.currentSlideIndex == this.album.albumLength) {
        this.albumIndex += 1
        this.albumIndex = this.albumIndex == this.albumCollection.length ? 0 : this.albumIndex;

        this.album.getAlbumData(this.albumCollection[this.albumIndex])
        this.album.loadAlbum(this.albumIndex)
        this.displaySlides()
      }
      this.playImageSet()
  }

  playRandomImages() {
    this.getRandomAlbum()
    let randomImageIx = this.shuffleIndexes(this.albumCollection[this.albumIndex]['images'])[0]
    this.displaySlides(randomImageIx)
    this.randomAlbumsIx += 1
  }

  playImageSet() {
      this.displaySlides(this.slides.currentSlideIndex)
      this.slides.setSlideIndex(this.slides.currentSlideIndex + 1)
  }

  getRandomAlbum() {
    this.albumIndex = this.randomAlbums[this.randomAlbumsIx]
    this.album.getAlbumData(this.albumCollection[this.albumIndex])
    this.album.loadAlbum(this.albumIndex)
    this.randomAlbumsIx += 1
  }

  randomAlbum() {
    this.getRandomAlbum()
    this.displaySlides()
  }

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

  showFraction(option, num, denom){
    if(option == 'slides') {
      const slideFractionDiv = document.getElementsByClassName("slide-fraction")[0]
      slideFractionDiv.innerHTML = `${num + 1} / ${denom}`
    } else {
      const albumFractionDiv = document.getElementsByClassName("album-fraction")[0]
      albumFractionDiv.innerHTML = `${this.albumIndex + 1} / ${denom}<br /><br />`
    }
  }
}


function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.children[0];
}

async function fetchAllData(albumIndex, slideIndex) {
  const response = await fetch("https://floaties.s3.us-west-1.amazonaws.com/floaties.json");
  const json = await response.json();
  return json
}

async function loadFunctionality() {
  const floaties = await fetchAllData(0,0)
  const slideshow = new Slideshow(floaties)

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