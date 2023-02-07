
const BASE_API_URL = "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;
let categories = [];


async function getCategoryIds() {
  // asing for 100 categories at once- so that we can shuffle through them randomly
  // categories?count=100 is added onto the base url for the api. This is the format the website provides for us
  let res = await axios.get(`${BASE_API_URL}categories?count=100`);
  let catIds = res.data.map((category) => category.id);

  // from MDN--- The _.sampleSize() method is used to give an array of n random elements from the given array.
  // using this to gather a random list of categories with our variable of NUM_CATEGORIES which is hard coded to be 6
  // returning 6 random category ids from our API
  return _.sampleSize(catIds, NUM_CATEGORIES);
}

async function getCategory(catId) {
  let res = await axios.get(`${BASE_API_URL}category?id=${catId}`);
  let cat = res.data;
  let allClues = cat.clues;
  //   again using the sample size method to get a random sample
  // we are now getting 5 random clues to put on our card.
  let randomClues = _.sampleSize(allClues, NUM_CLUES_PER_CAT);
  let clues = randomClues.map((category) => ({
    question: category.question,
    answer: category.answer,
    showing: null,
  }));

  return { title: cat.title, clues };
}



async function fillTable() {
  // jquery for Removing the content of all <thead> elements:
  $("#jeopardy thead").empty();
  // creating a tr element with jquery and saving it to a variable
  let $tr = $("<tr>");
  //   We are using a for loop to loop through NUM_CATEGORIES which is 6.
  // for each time we do that we are appending are rows to our heads and adding the text of the category title.
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    $tr.append($("<th>").text(categories[i].title));
  }
  //   we then append this to the game board
  $("#jeopardy thead").append($tr);

  // we now have each cateogry create, now its time to make the rows for the quesitons
  // first we empty the tbody
  $("#jeopardy tbody").empty();

  // we then loop through the num of clues to create 5 clues on each row
  for (let i = 0; i < NUM_CLUES_PER_CAT; i++) {
    // we make our 5 rows
    let $tr = $("<tr>");
    // then for each row we loop through NUM_CATEGORIES which is 6 because there will be 6 clues going horizontally
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      // each time we loop through we create and append a td element and give it an id
      // we also set its text to a '?'
      $tr.append($("<td>").attr("id", `${i}-${j}`).text("?"));
    }
    // we finish off with appending the tr which holds the td's into our tbody
    $("#jeopardy tbody").append($tr);
  }
}



function handleClick() {
  
  let id = this.id;
  // The split() method splits a string into an array of substrings.
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;
  // if the clue is falsy(set to null) then display the question
  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  }
  // if the element click already is displaying the question, then display the answer
  else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // if its already displaying the  answer ignor the click
    return;
  }
  // we now take the infromation from the if statement and update our cell's html with the msg so that we can keep track of the clicks
  $(`#${catId}-${clueId}`).html(msg);
}



async function setupAndStart() {
  let catIds = await getCategoryIds();
  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }
  fillTable();
  document.getElementById("spin-container").style.display = "none";
}

// using jquery we select the restart button with its ID
// we then add an event listener for a click and run the setupAndStart function- creating the game

$("#restart").on("click", setupAndStart);

/** On click of start / restart button, set up game. */

/** On page load, add event handler for clicking clues */
$(async function () {
  setupAndStart();
  $("#jeopardy").on("click", "td", handleClick);
});
