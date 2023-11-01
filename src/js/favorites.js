import axios from 'axios';
import Pagination from 'tui-pagination';
import svgSprite from '../img/icons.svg';
import modalFunctions from './modal';

const favorites = document.querySelector('.js-favorites');
const favoritesMessage = document.querySelector('.js-favorites-message');

const FAVORITES_LS_KEY = 'checkout';

let currentPage = 1;
let itemsPerPage = 8;

const checkoutProducts = [];

let checkoutFavorites =
  JSON.parse(localStorage.getItem(FAVORITES_LS_KEY)) ?? [];

function showFavorites(page = 1) {
  if (checkoutFavorites.length === 0) {
    favorites.insertAdjacentHTML(
      'beforeend',
      `<p class="favoritesMessage js-favorites-message">
    It appears that you haven't added any exercises to your favorites yet.
    To get started, you can add exercises that you like to your favorites
    for easier access in the future.
  </p>`
    );
  } else {
    favorites.innerHTML = '';
    favorites.insertAdjacentHTML(
      'beforeend',
      createMarkup(checkoutFavorites, page)
    );

    //Слухач на натискання скнопки START
    const arrFavEl = document.querySelectorAll('.favorites-card-item');

    arrFavEl.forEach(element => {
      element
        .querySelector('.btnStartFav')
        .addEventListener('click', async () => {
          const id = element.getAttribute('data-id');
          document.querySelector('.modal-general').setAttribute('data-id', id);

          await modalFunctions.setDataExerciseModal(id);
        });
    });

    //Слухач на натискання скнопки TRASH
    const arrFavTrash = document.querySelectorAll('.favorites-card-item');

    arrFavTrash.forEach(element => {
      //console.log(element.querySelector('.trash-icon'));

      element.querySelector('.trash-icon').addEventListener('click', event => {
        const cardId = element.getAttribute('data-id');

        let checkoutFavorites =
          JSON.parse(localStorage.getItem(FAVORITES_LS_KEY)) ?? [];

        const currentCard = checkoutFavorites.find(({ _id }) => _id === cardId); // знайшли обʼєкт поточного товару в масиві всіх товарів за id

        const newCardIdx = checkoutFavorites.findIndex(
          ({ _id }) => _id === cardId
        ); // знаходимо індекс вправи з масиву favorites (якщо такої вправи немає - повертає -1)

        if (newCardIdx !== -1) {
          // якщо це вправа є в localStorage
          checkoutFavorites.splice(newCardIdx, 1);
          localStorage.setItem(
            FAVORITES_LS_KEY,
            JSON.stringify(checkoutFavorites)
          );
          element.remove();
          updatePaginationFavorites(arrFavTrash / 8);
        }
        if (checkoutFavorites.length === 0) {
          favorites.insertAdjacentHTML(
            'beforeend',
            `<p class="favoritesMessage js-favorites-message">
    It appears that you haven't added any exercises to your favorites yet.
    To get started, you can add exercises that you like to your favorites
    for easier access in the future.
  </p>`
          );
        }
      });
    });
  }
}

showFavorites(currentPage);

function createMarkup(exercises, page = 1) {
  const windowInnerWidth = window.innerWidth;

  if (windowInnerWidth < 768) {
    itemsPerPage = 8;
  } else if (windowInnerWidth < 1440) {
    itemsPerPage = 10;
  } else {
    itemsPerPage = 0;
  }

  const totalItems = checkoutFavorites.length;
  let indStart = 0;
  let indEnd = totalItems;
  // let totalPages=0;

  if (itemsPerPage > 0) {
    indStart = (page - 1) * itemsPerPage;
    indEnd = page * itemsPerPage;
    if (indEnd > totalItems) {
      indEnd = totalItems;
    }
  }

  const arr = [];

  for (let i = indStart; i < indEnd; i++) {
    const favCard = `<div data-id="${exercises[i]._id}" class="favorites-card-item">
      <div class="favorites-card-workout">
      <p class="favorites-workout">WORKOUT</p>
      <div class="btnTrashFav">
      <svg class="trash-icon" width="16" height="16">
                  <use href="${svgSprite}#icon-trash"></use>
                </svg>
                </div>
              <div class="btnStartFav">
                <div class="favorites-start">Start</div>
              
                <svg class="favorites-header-arrow" width="16" height="16">
                  <use href="${svgSprite}#icon-arrow"></use>
                </svg>
              </div>
              </div>
  
              <div class="favorites-name">
              <div class="favorites-name-svg">
                <svg class="favorites-name-svg-svg" width="20" height="20">
                  <use href="${svgSprite}#icon-running-stick-figure"></use>
                </svg>
              </div>
              <div class="favorites-name-text">${exercises[i].name}</div>
            </div>
            <div class="description">
            <p class="description-burned-grey">Burned calories:</p>
            <p class="description-burned-normal">${exercises[i].burnedCalories} / ${exercises[i].time} min</p>
            <p class="description-part-grey">Body part:</p>
            <p class="description-part-normal">${exercises[i].bodyPart}</p>
            <p class="description-target-grey">Target:</p>
            <p class="description-target-normal">${exercises[i].target}</p>
            </div>
      </div>`;
    arr.push(favCard);
  }

  if (itemsPerPage > 0) {
    let totalPages = totalItems / itemsPerPage;
    totalPages = Math.trunc(totalPages);
    if (totalPages * itemsPerPage < totalItems) {
      totalPages = totalPages + 1;
    }

    updatePaginationFavorites(totalPages);
  }

  return arr.join(' ');
}

function updatePaginationFavorites(totalPages) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const options = {
    totalItems: totalPages * itemsPerPage,
    itemsPerPage: itemsPerPage,
    visiblePages: 5,
    page: currentPage,
  };

  const pagination = new Pagination(paginationContainer, options);

  pagination.on('beforeMove', event => {
    const newPage = event.page;
    currentPage = newPage;
    showFavorites(currentPage);
  });
}

//let totalPages = checkoutFavorites.length / 8;
