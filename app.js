const API_BASE_URL = "http://localhost:3000";
const MOVIES_URL = API_BASE_URL + "/movies";
const ACTORS_URL = API_BASE_URL + "/actors";

const statusMsg = document.getElementById("status");
const loadMoviesBtn = document.getElementById("loadMoviesBtn");
const movieList = document.getElementById("movieList");
const actorList = document.getElementById("actorList");
const createLeadActorSelect = document.getElementById("createLeadActor");
const updateLeadActorSelect = document.getElementById("updateLeadActor");
const loadMoviesMessage = document.getElementById("loadMoviesMessage");
const movieByIdMessage = document.getElementById("movieByIdMessage");
const createActorMessage = document.getElementById("createActorMessage");
const createMovieMessage = document.getElementById("createMovieMessage");
const updateMovieMessage = document.getElementById("updateMovieMessage");
const deleteMovieMessage = document.getElementById("deleteMovieMessage");

function setStatus(message, isError) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle("error", Boolean(isError));
}

function setSectionMessage(element, message, isError) {
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.classList.toggle("error", Boolean(isError) && Boolean(message));
}

function clearSectionMessage(element) {
  setSectionMessage(element, "", false);
}

function getNumericIdValue(id) {
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  return null;
}

async function getNextNumericId(url) {
  const records = await fetchResource(url);
  const maxId = records.reduce(function (highest, record) {
    const numericId = getNumericIdValue(record.id);

    if (numericId === null) {
      return highest;
    }

    return Math.max(highest, numericId);
  }, 0);

  return maxId + 1;
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

async function loadData(successMessage, errorTarget) {
  const target = errorTarget || loadMoviesMessage;
  clearSectionMessage(target);
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
    return true;
  } catch (error) {
    setSectionMessage(
      target,
      "Kunde inte hämta data. Kontrollera att json-server är igång.",
      true,
    );
    return false;
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
  clearSectionMessage(movieByIdMessage);

  const id = document.getElementById("movieIdInput").value.trim();

  try {
    const movie = await fetchResource(MOVIES_URL + "/" + id);
    const actor = await fetchResource(ACTORS_URL + "/" + movie.leadActorId);
    const actorName = actor.name || "Okänd";
    renderSingleMovie(movie, actorName);
    setStatus("Film med id " + id + " hämtad.");
  } catch (error) {
    singleMovieResult.textContent = "";
    setSectionMessage(
      movieByIdMessage,
      "Ingen film hittades med id " + id + ".",
      true,
    );
  }
});

async function createActor(name, nationality, birthYear) {
  const nextId = await getNextNumericId(ACTORS_URL);

  const response = await fetch(ACTORS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: nextId,
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
  clearSectionMessage(createActorMessage);

  const name = document.getElementById("createActorName").value.trim();
  const nationality = document
    .getElementById("createActorNationality")
    .value.trim();
  const birthYear = document.getElementById("createActorBirthYear").value;

  try {
    await createActor(name, nationality, birthYear);
    createActorForm.reset();
    const didLoad = await loadData(
      "Huvudskådis skapad! Listan uppdateras.",
      createActorMessage,
    );

    if (didLoad) {
      setSectionMessage(
        createActorMessage,
        "Huvudskådis skapad! Listan uppdateras.",
        false,
      );
    }
  } catch (error) {
    setSectionMessage(
      createActorMessage,
      "Fel: Kunde inte skapa huvudskådis.",
      true,
    );
  }
});

async function createMovie(title, genre, year, leadActorId) {
  const nextId = await getNextNumericId(MOVIES_URL);

  const response = await fetch(MOVIES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: nextId,
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
  clearSectionMessage(createMovieMessage);

  const title = document.getElementById("createTitle").value.trim();
  const genre = document.getElementById("createGenre").value.trim();
  const year = document.getElementById("createYear").value;
  const leadActorId = document.getElementById("createLeadActor").value;

  try {
    await createMovie(title, genre, year, leadActorId);
    createMovieForm.reset();
    const didLoad = await loadData(
      "Film skapad! Listan uppdateras.",
      createMovieMessage,
    );

    if (didLoad) {
      setSectionMessage(
        createMovieMessage,
        "Film skapad! Listan uppdateras.",
        false,
      );
    }
  } catch (error) {
    setSectionMessage(
      createMovieMessage,
      "Fel: Kunde inte skapa filmen.",
      true,
    );
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
  clearSectionMessage(updateMovieMessage);

  const id = document.getElementById("updateMovieId").value.trim();
  const title = document.getElementById("updateTitle").value.trim();
  const genre = document.getElementById("updateGenre").value.trim();
  const year = document.getElementById("updateYear").value;
  const leadActorId = document.getElementById("updateLeadActor").value;

  try {
    await updateMovie(id, title, genre, year, leadActorId);
    updateMovieForm.reset();
    const didLoad = await loadData(
      "Film med id " + id + " uppdaterad!",
      updateMovieMessage,
    );

    if (didLoad) {
      setSectionMessage(
        updateMovieMessage,
        "Film med id " + id + " uppdaterad!",
        false,
      );
    }
  } catch (error) {
    setSectionMessage(
      updateMovieMessage,
      "Fel: Kunde inte uppdatera filmen.",
      true,
    );
  }
});

async function deleteMovie(id) {
  let movie;

  try {
    movie = await fetchResource(MOVIES_URL + "/" + id);
  } catch (error) {
    if (error.message === "Request failed with status 404") {
      throw new Error("FILM_NOT_FOUND");
    }

    throw error;
  }

  if (!movie || movie.id === undefined || movie.id === null) {
    throw new Error("FILM_NOT_FOUND");
  }

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
  clearSectionMessage(deleteMovieMessage);

  const id = document.getElementById("deleteMovieId").value.trim();

  if (!/^\d+$/.test(id)) {
    setSectionMessage(
      deleteMovieMessage,
      "Ange ett giltigt numeriskt film-id.",
      true,
    );
    return;
  }

  try {
    await deleteMovie(id);
    deleteMovieForm.reset();
    const didLoad = await loadData(
      "Film med id " + id + " har tagits bort.",
      deleteMovieMessage,
    );

    if (didLoad) {
      setSectionMessage(
        deleteMovieMessage,
        "Film med id " + id + " har tagits bort.",
        false,
      );
    }
  } catch (error) {
    if (error.message === "FILM_NOT_FOUND") {
      setSectionMessage(
        deleteMovieMessage,
        "Ingen film hittades med id " + id + ".",
        true,
      );
      return;
    }

    setSectionMessage(
      deleteMovieMessage,
      "Fel: Kunde inte ta bort filmen.",
      true,
    );
  }
});

loadMoviesBtn.addEventListener("click", function () {
  loadData(undefined, loadMoviesMessage);
});

loadData(undefined, loadMoviesMessage);
