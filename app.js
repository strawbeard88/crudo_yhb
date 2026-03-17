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
  placeholder.textContent = "Välj huvudskådis";
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
  actorInfo.textContent = "Huvudskådis: " + actorName;

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
  info.textContent = actor.nationality + " • Född " + actor.birthYear;

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
    const actorName = actorsById.get(Number(movie.leadActorId)) || "Okänd";
    movieList.appendChild(createMovieItem(movie, actorName));
  });
}

function renderActors(actors) {
  actorList.innerHTML = "";

  if (!actors.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Inga huvudskådisar hittades.";
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

async function loadData(successMessage) {
  setStatus("Hämtar filmer och huvudskådisar...");

  try {
    const [movies, actors] = await Promise.all([
      fetchResource(MOVIES_URL),
      fetchResource(ACTORS_URL),
    ]);

    renderMovies(movies, actors);
    renderActors(actors);
    populateActorSelect(createLeadActorSelect, actors);
    populateActorSelect(updateLeadActorSelect, actors);
    setStatus(
      successMessage || "Data hämtad. Filmer och huvudskådisar visas nu.",
    );
  } catch (error) {
    setStatus(
      "Kunde inte hämta data. Kontrollera att json-server är igång.",
      true,
    );
  }
}

const movieByIdForm = document.getElementById("movieByIdForm");
const singleMovieResult = document.getElementById("singleMovieResult");

function renderSingleMovie(movie, actorName) {
  singleMovieResult.textContent = "";

  const titleText = document.createElement("strong");
  titleText.textContent = movie.title;

  const info = document.createElement("p");
  info.textContent = movie.genre + " • " + movie.year;

  const actorInfo = document.createElement("p");
  actorInfo.textContent = "Huvudskådis: " + actorName;

  const idTag = document.createElement("span");
  idTag.className = "post-id";
  idTag.textContent = "ID " + movie.id;

  singleMovieResult.appendChild(titleText);
  singleMovieResult.appendChild(info);
  singleMovieResult.appendChild(actorInfo);
  singleMovieResult.appendChild(idTag);
}

movieByIdForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = document.getElementById("movieIdInput").value.trim();

  try {
    const movie = await fetchResource(MOVIES_URL + "/" + id);
    const actor = await fetchResource(ACTORS_URL + "/" + movie.leadActorId);
    const actorName = actor.name || "Okänd";
    renderSingleMovie(movie, actorName);
    setStatus("Film med id " + id + " hämtad.");
  } catch (error) {
    singleMovieResult.textContent = "";
    const msg = document.createElement("p");
    msg.className = "empty";
    msg.textContent = "Ingen film hittades med id " + id + ".";
    singleMovieResult.appendChild(msg);
    setStatus("Ingen film hittades med id " + id + ".", true);
  }
});

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
    throw new Error("Kunde inte skapa huvudskådis");
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
    createActorForm.reset();
    await loadData("Huvudskådis skapad! Listan uppdateras.");
  } catch (error) {
    setStatus("Fel: Kunde inte skapa huvudskådis.", true);
  }
});

async function createMovie(title, genre, year, leadActorId) {
  const response = await fetch(MOVIES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title,
      genre: genre,
      year: Number(year),
      leadActorId: Number(leadActorId),
    }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte skapa filmen");
  }

  return response.json();
}

const createMovieForm = document.getElementById("createMovieForm");

createMovieForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("createTitle").value.trim();
  const genre = document.getElementById("createGenre").value.trim();
  const year = document.getElementById("createYear").value;
  const leadActorId = document.getElementById("createLeadActor").value;

  try {
    await createMovie(title, genre, year, leadActorId);
    createMovieForm.reset();
    await loadData("Film skapad! Listan uppdateras.");
  } catch (error) {
    setStatus("Fel: Kunde inte skapa filmen.", true);
  }
});

async function updateMovie(id, title, genre, year, leadActorId) {
  const response = await fetch(MOVIES_URL + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title,
      genre: genre,
      year: Number(year),
      leadActorId: Number(leadActorId),
    }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte uppdatera filmen");
  }

  return response.json();
}

const updateMovieForm = document.getElementById("updateMovieForm");

updateMovieForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = document.getElementById("updateMovieId").value.trim();
  const title = document.getElementById("updateTitle").value.trim();
  const genre = document.getElementById("updateGenre").value.trim();
  const year = document.getElementById("updateYear").value;
  const leadActorId = document.getElementById("updateLeadActor").value;

  try {
    await updateMovie(id, title, genre, year, leadActorId);
    updateMovieForm.reset();
    await loadData("Film med id " + id + " uppdaterad!");
  } catch (error) {
    setStatus("Fel: Kunde inte uppdatera filmen.", true);
  }
});

async function deleteMovie(id) {
  const response = await fetch(MOVIES_URL + "/" + id, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Kunde inte ta bort filmen");
  }
}

const deleteMovieForm = document.getElementById("deleteMovieForm");

deleteMovieForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = document.getElementById("deleteMovieId").value.trim();

  try {
    await deleteMovie(id);
    deleteMovieForm.reset();
    await loadData("Film med id " + id + " har tagits bort.");
  } catch (error) {
    setStatus("Fel: Kunde inte ta bort filmen.", true);
  }
});

loadMoviesBtn.addEventListener("click", function () {
  loadData();
});

loadData();
