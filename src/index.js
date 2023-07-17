import Notiflix from "notiflix";
import 'notiflix/src/notiflix.css';
import simpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import { getImages } from "./js/pixabay-api";
import debounce from "lodash.debounce";



const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const galleryLightBox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: '250',
  });
const loadMoreButton = document.querySelector(".load-more-btn");
let page = 1;
let querry = '';
let maxPage = 0;

  
gallery.classList.add('hide');
searchForm.addEventListener('submit', onFormSubmit);
window.addEventListener('scroll', debounce(onScroll, 800));

function onFormSubmit(event){
    event.preventDefault();
    gallery.classList.remove('hide')
    const inputValue = searchForm.elements.searchQuery.value.trim();
    if (inputValue === '') return Notiflix.Notify.failure('Empty search querry');
    querry = inputValue;
    clearGallery();
    page = 1;
    fetchImages()
      .then(hits => {
        if (hits) {
          Notiflix.Notify.success(`We found ${hits} images.`);
          maxPage = Math.ceil(hits / 40);
        }
      })
      .catch(onError)
}

function clearGallery() {
    gallery.innerHTML = " ";
  }

async function fetchImages() {
    try {
      const data = await getImages(querry, page);
      if (!data.hits.length)
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      page += 1;
      const markup = await makeGalleryItems(data.hits);
      if (markup === undefined) throw new Error('No data!');
      await renderGallery(markup);
      console.log(markup);
      return data.totalHits;
    } catch (error) {
      onError(error);
    }
  }

  function onError(error) {
    Notiflix.Notify.failure(error.message);
  }

  
  function makeGalleryItems(data) {
    return data.reduce(
      (markup, currentEl) => markup + createGalleryItem(currentEl),
      ''
    );
  }

  function renderGallery(markup) {
    console.log(gallery)
    gallery.insertAdjacentHTML('beforeend', markup)
    galleryLightBox.refresh();
  }

  function createGalleryItem({
    largeImageURL,
    webformatURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  }) {
    return `<div class="photo-card">
    <div class="photo">
    <a href="${largeImageURL}">
      <img
        class="gallery__image"
        src="${webformatURL}"
        alt="${tags}"
      />
      </a>
      </div>
      <div class="info">
      <p class="info-item">
        <b>Likes</b> ${likes}
      </p>
      <p class="info-item">
        <b>Views</b> ${views}
      </p>
      <p class="info-item">
        <b>Comments</b> ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b> ${downloads}
      </p>
      </div>
    </div>`;
  }

  function onScroll() {
    const scrollPosition = Math.ceil(window.scrollY);
    const bodyHeight = Math.ceil(document.body.getBoundingClientRect().height);
    const screenHeight = window.screen.height;
    if (bodyHeight - scrollPosition < screenHeight) {
      if (page <= maxPage) {
        fetchImages();
      } else {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  }

 