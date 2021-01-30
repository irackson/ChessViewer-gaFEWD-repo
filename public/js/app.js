var prior_ratings;
var average_rating;
var current_rating;

window.onload = function () {
  localStorage.clear();
  sessionStorage.clear();

  const bodyHeight = document.querySelector('body').offsetHeight;
  const newHeight = 500 + window.innerHeight - bodyHeight;
  const newHeightString = "height: " + newHeight + "px";
  document.getElementById('space-gap').setAttribute('style', newHeightString);

  function getVersion() {
    return "1.0";
  };
  function getDate() {
    const date = new Date().toLocaleDateString();
    return date.substr(0, (date.length - 5));
  };

  const vElem = document.createElement('p');
  const dElem = document.createElement('p');

  vElem.innerHTML = getVersion();
  dElem.innerHTML = getDate();

  document.getElementById('specs-values').appendChild(vElem);
  document.getElementById('specs-values').appendChild(dElem);

  document.querySelector('.avg-stars').classList.remove('hide');

  updateAverageDisplay();

  async function getRecentDaily(numberViewed) {
    const leaderboard_API = 'https://api.chess.com/pub/leaderboards';
    const leaderboards_response = await fetch(leaderboard_API);
    const leaderboards_result = await leaderboards_response.json();

    const leaderArchive_API = 'https://api.chess.com/pub/player/' + leaderboards_result.daily[0].username + '/games/archives';
    const leaderArchive_response = await fetch(leaderArchive_API);
    const leaderArchive_result = await leaderArchive_response.json();

    const numberAvailable = leaderArchive_result.archives.length;
    const gameIndex = circularReduction(numberViewed, numberAvailable);

    const daily_API = leaderArchive_result.archives[gameIndex - 1];
    const daily_response = await fetch(daily_API);
    const daily_result = await daily_response.json();

    return daily_result.games[0].pgn;
  };

  async function getFen(pgnString) {

    //https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
      targetUrl = 'https://us-central1-fewd-c09af.cloudfunctions.net/addMessage?text=' + pgnString
    fetch(proxyUrl + targetUrl)
      .then(blob => blob.json())
      .then(fen_result => {
        const fenID = fen_result.result;

        const app = firebase.app();
        const db = firebase.firestore()
        const entry = db.collection('messages').doc(fenID);
        entry.get()
          .then(doc => {
            const pgn = doc.data().pgn;
            let fenString = doc.data().fen;
            const fenArray = fenString.split("\n");
            fenArray.unshift("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
            fenArray.pop();
            try {
              for (let i = 0; i < fenArray.length; i++) {
                localStorage.setItem(i.toString(), fenArray[i]);
              }
            } catch (e) {
              console.log("localstorage error: " + e);
            }
            document.getElementById('chess-frame').src = "chessboard/chess.html";


            return fenString;
          });
      })
      .catch(e => {
        console.log(e);
        return e;
      });
  };

  async function getArchives(numberViewed) {

    let gameString;
    try {
      gameString = await getRecentDaily(numberViewed);
    } catch (e) {
      console.log("gameString error: " + e);
    }

    let moves;
    try {
      moves = getMoves(gameString);
    } catch (e) {
      console.log('parsing error... next game');

      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      async function doSleep(delay) {
        await sleep(delay);
      }
      doSleep(5000);

      getArchives(Math.floor(Math.random() * 1000));
    }

    try {
      await getFen(moves);
    } catch (e) {
      console.log("getFen(moves) error: " + e);
    }
  }
  getArchives(Math.floor(Math.random() * 1000));
  function getMoves(gameString) {
    const data = gameString.split("\"]");
    displayGameInfo(data);
    let moveString = data[data.length - 1].trim().split(" ");
    moveString.pop();
    moveString = moveString.filter(e => e.indexOf('{') === -1).filter(e => e.indexOf('}') === -1);
    let moves = "";
    for (let i = 0; i < moveString.length; i++) {
      moves = moves + " " + moveString[i];
    }
    return moves.trim();
  }

  function displayGameInfo(data) {

    function numericScoreToSide(scores) {
      if (scores[0] > scores[1]) {
        return "White";
      } else if (scores[0] < scores[1]) {
        return "Black";
      } else {
        return "Draw";
      }

    }

    const white = data.filter(s => s.includes('White'))[0].split('"')[1].split('_').join(" ");
    const whiteElo = data.filter(s => s.includes('WhiteElo'))[0].split('"')[1];
    const black = data.filter(s => s.includes('Black'))[0].split('"')[1].split('_').join(" ");
    const blackElo = data.filter(s => s.includes('BlackElo'))[0].split('"')[1];
    const result = numericScoreToSide(data.filter(s => s.includes('Result'))[0].split('"')[1].split("").filter(e => e.indexOf('-') === -1));
    const date = data.filter(s => s.includes('Date'))[0].split('"')[1];

    document.getElementById('white').innerText = "White: " + white + " (" + whiteElo + ")";
    document.getElementById('black').innerText = "Black: " + black + " (" + blackElo + ")";
    document.getElementById('result').innerText = "Result: " + result;
    document.getElementById('date').innerText = "Date: " + date;
  }


  //finds proper index even when out of bounds by going in a circle using mod
  function circularReduction(numberViewed, numberAvailable) {
    let index;
    if (numberViewed >= numberAvailable) {
      index = numberAvailable - numberViewed % numberAvailable;
    } else {
      index = numberAvailable - numberViewed;
    }
    return index;
  }

};


/* FOOTER RATING CODE */


/* start of code from https://codepen.io/brianknapp/pen/JEotD/?editors=1111 */

const starEls = document.querySelectorAll('.star.rating');
starEls.forEach(star => {
  star.addEventListener('click', function (e) {
    let starEl = e.currentTarget;
    current_rating = starEl.dataset.rating;
    starEl.parentNode.setAttribute('data-stars', current_rating);
  });
})

/* end of code from https://codepen.io/brianknapp/pen/JEotD/?editors=1111 */

document.getElementById('submit_form').addEventListener("submit", function (submit_evt) {
  submit_evt.preventDefault();
  if (current_rating === undefined) {
    prior_ratings.push(1);
  }
  else {
    prior_ratings.push(parseInt(current_rating));
  }

  const db = firebase.firestore();
  const entry = db.collection('publicinput').doc('posts').collection('0').doc('info');
  entry.update({ ratings: prior_ratings });
  updateAverageDisplay();
});


function average(nums) {
  if (nums.length === 0) {
    return 0;
  }
  else {
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
      sum += nums[i];
    }
    const ave = Math.round((sum / nums.length));
    return ave;
  }
}

function updateAverageDisplay() {

  const app = firebase.app();
  const db = firebase.firestore()
  const entry = db.collection('publicinput').doc('posts').collection('0').doc('info');

  entry.get()
    .then(doc => {
      prior_ratings = doc.data().ratings;

      const numRatings = prior_ratings.length;
      document.getElementById('total-ratings').innerHTML = "Total Ratings: " + numRatings;


      average_rating = average(prior_ratings);

      const avg_starEls = document.querySelectorAll('.avg-star');
      for (let i = 0; i < avg_starEls.length; i++) {
        const star = avg_starEls[i];
        if (i < average_rating) {
          star.setAttribute('fill', '#ffd055');
        }
        else {
          star.setAttribute('fill', '#d8d8d8')
        }
      }

    });
}

/* end of FOOTER RATING CODE */

/* SIDEBAR CODE */

var instructions_closed = false;

function instructionsToggle() {
  if (instructions_closed === false) {
    document.getElementById('instructions-content').setAttribute('style', 'display: none');
    instructions_closed = true;
  }
  else {
    document.getElementById('instructions-content').setAttribute('style', 'display: block');
    instructions_closed = false;
  }
}

document.getElementById('instructions-trigger').addEventListener('click', instructionsToggle);

var controls_closed = false;

function controlsToggle() {
  if (controls_closed === false) {
    document.getElementById('controls-content').classList.add('hide');
    controls_closed = true;
  }
  else {
    document.getElementById('controls-content').classList.remove('hide');
    controls_closed = false;
  }
}