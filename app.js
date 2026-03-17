const API_BASE_URL = "http://localhost:3000";
const MOVIES_URL = API_BASE_URL + "/movies";
const ACTORS_URL = API_BASE_URL + "/actors";

const statusMsg = document.getElementById("status");
const loadMoviesBtn = document.getElementById("loadMoviesBtn");
const movieList = document.getElementById("movieList");
const actorList = document.getElementById("actorList");
const createLeadActorSelect = document.getElementById("createLeadActor");
const updateLeadActorSelect = document.getElementById("updateLeadActor");

function setStatus(message, isError) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle("error", Boolean(isError));
}

function createOption(actor) {
  const option = document.createElement("option");
  option.value = String(actor.id);
  option.textContent = actor.name;
  return option;
}

function populateActorSelect(select, actors) {
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Valj huvudskadis";
  select.appendChild(placeholder);

  actors.forEach(function (actor) {
    select.appendChild(createOption(actor));
  });
}

function createMovieItem(movie, actorName) {
  const item = document.createElement("li");
  item.className = "post-item";

  const content = document.createElement("div");

  const titleText = document.createElement("strong");
  titleText.textContent = movie.title;

  const info = document.createElement("p");
  info.textContent = movie.genre + " • " + movie.year;

  const actorInfo = document.createElement("p");
  actorInfo.textContent = "Huvudskadis: " + actorName;

  content.appendChild(titleText);
  content.appendChild(info);
  content.appendChild(actorInfo);

  const idTag = document.createElement("span");
  idTag.className = "post-id";
  idTag.textContent = "ID " + movie.id;

  item.appendChild(content);
  item.appendChild(idTag);

  return item;
}

function createActorItem(actor) {
  const item = document.createElement("li");
  item.className = "post-item";

  const content = document.createElement("div");

  const nameText = document.createElement("strong");
  nameText.textContent = actor.name;

  const info = document.createElement("p");
  info.textContent = actor.nationality + " • Fodd " + actor.birthYear;

  content.appendChild(nameText);
  content.appendChild(info);

  const idTag = document.createElement("span");
  idTag.className = "post-id";
  idTag.textContent = "ID " + actor.id;

  item.appendChild(content);
  item.appendChild(idTag);

  return item;
}

function renderMovies(movies, actors) {
  movieList.innerHTML = "";

  if (!movies.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Inga filmer hittades.";
    movieList.appendChild(empty);
    return;
  }

  const actorsById = new Map(
    actors.map(function (actor) {
      return [Number(actor.id), actor.name];
    }),
  );

  movies.forEach(function (movie) {
    const actorName = actorsById.get(Number(movie.leadActorId)) || "Okand";
    movieList.appendChild(createMovieItem(movie, actorName));
  });
}

function renderActors(actors) {
  actorList.innerHTML = "";

  if (!actors.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Inga huvudskadisar hittades.";
    actorList.appendChild(empty);
    return;
  }

  actors.forEach(function (actor) {
    actorList.appendChild(createActorItem(actor));
  });
}

async function fetchResource(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }

  return response.json();
}

async function loadData() {
  setStatus("Hamtar filmer och huvudskadisar...");

  try {
    const [movies, actors] = await Promise.all([
      fetchResource(MOVIES_URL),
      fetchResource(ACTORS_URL),
    ]);

    renderMovies(movies, actors);
    renderActors(actors);
    populateActorSelect(createLeadActorSelect, actors);
    populateActorSelect(updateLeadActorSelect, actors);
    setStatus("Data hamtad. Filmer och huvudskadisar visas nu.");
  } catch (error) {
    setStatus(
      "Kunde inte hamta data. Kontrollera att json-server ar igang.",
      true,
    );
  }
}

async function createActor(name, nationality, birthYear) {
  const response = await fetch(ACTORS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      nationality: nationality,
      birthYear: Number(birthYear),
    }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte skapa huvudskadis");
  }

  return response.json();
}

const createActorForm = document.getElementById("createActorForm");

createActorForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("createActorName").value.trim();
  const nationality = document
    .getElementById("createActorNationality")
    .value.trim();
  const birthYear = document.getElementById("createActorBirthYear").value;

  try {
    await createActor(name, nationality, birthYear);
    setStatus("Huvudskadis skapad! Listan uppdateras.");
    createActorForm.reset();
    loadData();
  } catch (error) {
    setStatus("Fel: Kunde inte skapa huvudskadis.", true);
  }
});

loadMoviesBtn.addEventListener("click", function () {
  loadData();
});

loadData();
