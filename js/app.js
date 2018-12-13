/*
 * Create a list that holds all of your cards
 */
let deckElement; // deck HTML element
let cards = []; // array of cards symbols in deck
let cardsShown = []; // array of cards shown to user
let cardsMatched = 0; // tracked number of cards matched
let movesCounter = 0; // track how many cards flipped by user
let timeInSeconds = 0; // track how many seconds since game start
let timer; // timer that updates how many seconds since game start

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/*
 * Show all cards in card deck to user.
 * @parm cElements are card elements within card deck
 */
function cardDeckDisplay(cElements) {
  for(let c=0; c<cElements.length; ++c) {
    cElements[c].classList.remove("match"); // if refresh
    cardShow(cElements[c]);
  }
  return cElements;
}

/*
 * Quickly show card deck to user and then hide cards in deck.
 * @parm cElements are card elements within card deck
 */
function cardDeckFlashDisplay(cElements) {
  cardDeckDisplay(cElements);
  cardDeckHide(cElements)
}

/*
 * Hide all cards in card deck to user.
 * @parm cElements are card elements within card deck
 */
function cardDeckHide(cElements){
  for(let c=0; c<cElements.length; ++c) {
    setTimeout(function hide(){
      cardHide(cElements[c]);
    }, 1000);
  }
  return cElements;
}

/*
 * Get card symbols in card elements of card deck HTML element.
 * @param cElements are card elements in deck
 * @param cardsArray to store card symbols
 */
function getCardsInCardDeck(cElements, cardsArray) {
  for(let c=0; c<cElements.length; ++c) {
    cardsArray.push(cardSymbol(cElements[c]));
  }
  return cardsArray;
}

/*
* Setup card displayed within card deck for start of a new game based on
* card symbols provided in array.
*
*/
function setupCardDeckDisplay(cdElement, cardsArray) {
  cdElement.innerHTML = ''; // clear out previous cards
  for(let c=0; c<cardsArray.length; ++c) {
    let listElement = document.createElement("li");
    listElement.classList.add("card");
    let symbolElement = document.createElement("i");
    symbolElement.classList.add("fa");
    symbolElement.classList.add(cardsArray[c]);
    listElement.appendChild(symbolElement);
    cdElement.appendChild(listElement);
  }
}

/*
 * Upon load of web page:
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
 document.addEventListener("DOMContentLoaded", function(event) {
   deckElement = document.getElementsByClassName('deck')[0];
   let cardElements = deckElement.getElementsByClassName('card');
   cards = getCardsInCardDeck(cardElements, []);
   cardDeckFlashDisplay(cardElements); // quick display to user

   // Event listener for when user clicks on a card
   deckElement.addEventListener("click", function(event){
     let c = event.target;
     if (!c) return;
     if (!deckElement.contains(c)) return;
     if (c.classList.length == 1) { // means not opened or matched
        cardShow(c);
        movesCounter = movesIncrement(movesCounter);
        movesCounterDisplay(movesCounter);
        let starsCounter = updateStarsDisplay(movesCounter);
        addCardsShown(c, cardsShown);
        if (cardsShown.length > 1){
          if (isCardsShownMatch(cardsShown)){
            cardsShownMatch(cardsShown);
            gameOver(starsCounter);
          } else { // no match, flip cards
            cardsShownNoMatch(cardsShown);
          }
        }
     }
   });

   // Event listener for when user clicks on restart game
   let restartElements = document.getElementsByClassName('restart');
   for (let r = 0; r < restartElements.length; r++) {
     restartElements[r].addEventListener("click", function(event){
       let c = event.target;
       if (!c) return;
       gameReset();
     });
   }

   // Event listener for when user clicks on 'X' to close Winner modal
   document.getElementsByClassName("close")[0].addEventListener("click", function(event){
     let c = event.target;
     if (!c) return;
     hideWinPanel();
   });

   timerStart();
 });

/*
 * Reset the game:
 * 1) Stop timer and reset time tracked
 * 2) Reset counter to track number of moves
 * 3) Reset count of matched pairs
 * 4) Shuffle cards and set up display of cards
 * 5) Restart timer
 */
function gameReset() {
  hideWinPanel();
  timerStop();
  timeInSeconds = 0;
  hours = 0;
  minutes = 0;
  updateTimerDisplay(0);
  movesCounter = 0;
  movesCounterDisplay(movesCounter);
  cardsMatched = 0;
  shuffle(cards);
  setupCardDeckDisplay(deckElement, cards);
  resetStarsDisplay();
  cardElements = deckElement.getElementsByClassName('card');
  cardDeckFlashDisplay(cardElements);
  timerStart();
}

/*
 * Check if all card pairs have matched then:
 * 1) Stop timer
 * 2) Display win message to user
 * @parm starsLeft is number of stars left
 */
function gameOver(starsLeft) {
  if (cardsMatched == cards.length){ // Game Over!
    timerStop();
    displayWinPanel(starsLeft);
  }
}

/*
 * Stop and clear timer that tracks how long game has been played.
 */
function timerStop() {
  clearInterval(timer);
}

/*
 * Start timer to track how long game has been played.
 */
function timerStart() {
  timer = setInterval(function tick(){
    timeInSeconds++;
    updateTimerDisplay(timeInSeconds);
  }, 1000);
}

/*
 * Update display of timer displayed to user to show how long game has
 * been played.
 * @param totalSeconds is total seconds since game started
 */
function updateTimerDisplay(totalSeconds){
  let hours = 0;
  if (totalSeconds >= 3600) {
    hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
  }
  let minutes = 0;
  if (totalSeconds >= 60){
    minutes = Math.floor(totalSeconds / 60);
  }
  let seconds = totalSeconds % 60;
  // pad with leading zeroes
  let timerElement = document.getElementById("timer");
  timerElement.textContent = String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

/*
 * Show card's symbol to user.
 * @param card with symbol to show to user
 */
function cardShow(card) {
  if (card != null && card != undefined){
    card.classList.add("open");
    setTimeout(function show(){
      card.classList.add("show");
    }, 1000);
  }
}

/*
 * Hide card's symbol to user.
 * @param card with symbol to hide from user
 */
function cardHide(card) {
  if (card != null && card != undefined){
    card.classList.add("close");
    setTimeout(function hide(){
      card.classList.remove("open");
      card.classList.remove("show");
      card.classList.remove("close");
    }, 1000);
  }
}

/*
* Pair of 'open' cards to matched so lock the cards in the open position.
* @param openCardPair is pair of 'open' cards
*/
function cardsShownMatch(openCardPair) {
  while (openCardPair.length > 0){
    let c = openCardPair.pop();
    c.classList.add("match");
    c.classList.remove("open");
    c.classList.remove("show");
  }
  cardsMatched += 2; // track how many pairs of cards have matched
  return openCardPair;
}

/*
 * Pair of 'open' cards shown to user do not match so
 * 1) Change color of cards to indicate no match
 * 2) Flip cards to not show to user
 * 3) Clear list of 'open' cards
 * @param openCardPair is pair of 'open' cards
 */
function cardsShownNoMatch(openCardPair) {
  while (openCardPair.length > 0){
    let c = openCardPair.pop();
    c.classList.add("nomatch");
    setTimeout(function hide(){
      c.classList.remove("nomatch");
      cardHide(c);
    }, 1000);
  }
  return openCardPair;
}

/*
 * Add the card to a list of 'open' cards.
 * @param card with symbol shown to user
 * @param openCardPair is pair of 'open' cards
 */
function addCardsShown(card, openCardPair) {
  openCardPair.push(card);
  return openCardPair;
}

/*
 * Get symbol of card.
 * @param card with symbol
 */
function cardSymbol(card) {
  let cardSymbols = card.firstElementChild.classList;
  for(let i=0; i<cardSymbols.length; ++i) {
    if (cardSymbols[i] != "fa"){
      return cardSymbols[i];
    }
  }
  return null;
}
/*
 * Check if cards opened or shown match.
 * @param openCardPair is pair of 'open' cards
 */
function isCardsShownMatch(openCardPair) {
  if (openCardPair.length == 2){
    // get first card symbol
    let c1 = cardSymbol(openCardPair[0]);
    // get second card symbol
    let c2 =cardSymbol(openCardPair[1]);
    // match card symbols
    if (c1 == c2){
      return true;
    }
  }
  return false;
}

/*
* Increment the moves counter and display to user.
* @counter is moves counter
*/
function movesIncrement(counter) {
  counter++;
  return counter;
}

/*
 * Set the moves counter displayed to user.
 * @counter is moves counter
 */
function movesCounterDisplay(counter){
  let mc = document.getElementsByClassName("moves")[0];
  mc.textContent = counter;
}

/*
 * Update number of stars displayed based on counter of moves.
 * For every 20 moves, a star is removed.
 * @param counter tracking number of user moves
 */
function updateStarsDisplay(counter){
  let stars = document.getElementsByClassName("fa-star");

  // for every 16 moves (or number of cards), remove a star
  if (counter > 0 && stars.length > 0){
    let penaltyLimit = cards.length + 1; 
    let z = counter % penaltyLimit;
    if (z == 0){
      stars[0].classList.add("fa-star-o");
      stars[0].classList.remove("fa-star");
    }
  }
  return stars.length;
}

/*
 * Reset number of stars displayed for new game.
 */
function resetStarsDisplay() {
  let stars = document.getElementsByClassName("stars")[0];
  starsCounter = stars.getElementsByTagName("li").length;
  stars.innerHTML = "";
  for(let s=0; s<starsCounter; ++s){
    let listElement = document.createElement("li");
    let starElement = document.createElement("i");
    starElement.classList.add("fa");
    starElement.classList.add("fa-star");
    listElement.appendChild(starElement);
    stars.appendChild(listElement);
  }
}

/*
 * Display win panel to user with a win message.
 * @parm starsLeft is number of stars left
 */
function displayWinPanel(starsLeft){
  let winMsg = document.getElementById("win_message");
  winMsg.textContent = "You completed within ";
  if (timeInSeconds >= 3600) { // more than an hour
    winMsg.textContent += document.getElementById("timer").textContent;
  } else {
    if (timeInSeconds >= 60){
      let minutes = Math.floor(timeInSeconds / 60);
      winMsg.textContent += minutes + " minute";
      if (minutes > 1) winMsg.textContent +=  "s";
    }
    let seconds = timeInSeconds % 60;
    if (seconds > 0){
      if (timeInSeconds >= 60){ // means more than a minute
        winMsg.textContent += " ";
      }
      winMsg.textContent += seconds + " second";
      if (seconds > 1) winMsg.textContent +=  "s";
    }
  }
  if (starsLeft > 0){
    winMsg.textContent +=  " with "+ starsLeft + " star";
    if (starsLeft > 1) winMsg.textContent +=  "s";
    winMsg.textContent +=  " left!";
  } else {
    winMsg.textContent +=  ".";
  }
  let winPanel = document.getElementsByClassName("win-panel")[0];
  winPanel.style.display = "block";
}

/*
 * Hide win panel from user and display game panel for new game.
 */
function hideWinPanel(){
  let winPanel = document.getElementsByClassName("win-panel")[0];
  winPanel.style.display = "none";
}
