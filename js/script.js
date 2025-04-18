console.log("Let's write JavaScript");
 
// Global variables
let currentSong = new Audio();
let songs = [];
let currFolder;

// Function to convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds)) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from a folder
async function getSongs(folder) {
  currFolder = folder;
  console.log(`Trying to fetch: /songs/${folder}/info.json`); 
  const response = await fetch(`songs/${folder}/info.json`);
  const data = await response.json();
  songs = data.songs.map(song => song.file);

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = data.songs.map((song) => {
    return `
      <li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info"><div>${song.title}</div></div>
        <div class="playNow">
          <span aria-hidden="true" style="opacity: 0;">Play Now</span>
          <img class="invert" src="img/play.svg" alt="Play">
        </div>
      </li>`;
  }).join("");

  Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
    li.addEventListener("click", () => {
      playMusic(data.songs[index].file);
    });
  });
}


// Function to fetch the list of playlists
async function getPlaylists() {
  return ["Chill-Vibes", "Upbeat-Energetic"]; // manually add your folder names
}


// Function to play music
const playMusic = (track, pause = false) => {
  if (!track) {
    console.error("No track provided");
    return;
  }

  // Manually create a new Audio element with type set
  const newAudio = document.createElement("audio");
  newAudio.src = `/songs/${currFolder}/${track}.mp3`;

  // Replace the current audio object
  currentSong.pause();
  currentSong = newAudio;

  if (!pause) {
    currentSong
      .play()
      .then(() => {
        play.src = "img/pause.svg";
      })
      .catch((error) => {
        console.error("Error playing song:", error);
      });
  }

  // Update the song info in the playbar
  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track).replace(".mp3", "");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  // Set up time update again
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
  });
};


// Function to display albums
async function displayAlbums() {
  const folders = await getPlaylists();
  const cardContainer = document.querySelector(".cardContainer");

  for (let folder of folders) {
    const response = await fetch(`songs/${folder}/info.json`);
    const data = await response.json();

    cardContainer.innerHTML += `
      <div data-folder="${folder}" class="card">
        <div class="play">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000"
              stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <img src="songs/${folder}/${data.cover}" alt="">
        <h2>${data.title}</h2>
        <p>${data.description}</p>
      </div>`;
  }

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async () => {
      await getSongs(card.dataset.folder);
      playMusic(songs[0]);
    });
  });
}


// Main function to initialize the player
async function main() {
  // Fetch the list of playlists
  let playlists = await getPlaylists();

  // Load the first playlist dynamically
  if (playlists.length > 0) {
currFolder = playlists[0];  
await getSongs(currFolder);
playMusic(songs[0], true);
  } else {
    console.error("No playlists found.");
  }

  // Display all albums
  displayAlbums();

  // Play/Pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
  });

  // When the current song ends, play the next one
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      // Loop back to the first song when the last song ends
      playMusic(songs[0]);
    }
  });
  
  const seekbar = document.querySelector(".seekbar");

  currentSong.addEventListener("timeupdate", () => {
      seekbar.value = (currentSong.currentTime / currentSong.duration) * 100;
  });
  
  seekbar.addEventListener("input", (e) => {
      currentSong.currentTime = (e.target.value * currentSong.duration) / 100;
  });
  
  
  

  // Hamburger menu event
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Close button event
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous button event
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next button event
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume control event
  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // Mute/Unmute event
  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (currentSong.volume > 0) {
      currentSong.volume = 0;
      e.target.src = "img/mute.svg";
      document.querySelector(".range input").value = 0;
    } else {
      currentSong.volume = 0.5;
      e.target.src = "img/volume.svg";
      document.querySelector(".range input").value = 50;
    }
  });
}

// Initialize the player
main();
