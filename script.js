// HELPERS
// ------------------------------------------------
let $ = (e, a = false) =>
  a ? document.querySelectorAll(e) : document.querySelector(e);

// VARIABLES
// ------------------------------------------------
let body = $("body");
let form = $(".form");
let spinner = $(".spinner");
let scene = $(".scene");
let fullscreen = $("#full-screen");
let close = $("#close");
let small = $("#small");
let half = $("#half");
let original = $("#original");

// animate_scene
function animate_scene() {
  let boat = $(".boat>svg");
  let stars = $(".stars>svg>g", true);
  let leafs = $(".leafs>svg>path", true);

  let boat_rotation = 180;

  if (boat !== null) {
    gsap.to(boat, {
      x: () => scene.offsetWidth + "px",
      ease: "linear",
      duration: 60,
      repeat: -1,
      yoyo: true,
      transformOrigin: "0, 50%",
      onRepeat: () => {
        gsap.set(boat, {
          rotateY: boat_rotation,
        });
        boat_rotation = boat_rotation === 180 ? 0 : 180;
      },
    });
  }

  if (stars !== null) {
    stars.forEach((i, index) => {
      gsap.fromTo(
        i,
        {
          scale: ".8",
          transformOrigin: "50%, 50%",
        },
        {
          scale: "1.2",
          ease: "ease-in",
          duration: ".4",
          delay: () => Math.random() * (index / 2),
          repeat: -1,
          yoyo: true,
        }
      );
    });
  }

  if (leafs !== null) {
    leafs.forEach((i, index) => {
      gsap.fromTo(
        i,
        {
          x: "-20",
          y: "-40",
        },
        {
          x: "220",
          y: "60",
          rotation: -90,
          opacity: 0,
          duration: () => Math.random() * index + 10,
          delay: () => Math.random() * index,
          repeat: -1,
        }
      );
    });
  }
}

// HANDLING FORM SUBMISSION
// ------------------------------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Spinner -> On
  spinner.setAttribute("data-animation", "on");

  // Cleaning up
  body.removeAttribute("style");
  scene.innerHTML = "";
  scene.removeAttribute("style");

  // File Access
  let TOKEN = $("#token").value;
  let KEY = $("#key").value;

  // Requesting
  fetch(`https://api.figma.com/v1/files/${KEY}/nodes?ids=1%3A2`, {
    method: "GET",
    headers: {
      "x-figma-token": TOKEN,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      let _document = res.nodes["1:2"].document.children;
      let _childrenLength = _document.length;

      let _placeMap = [];

      for (let i = 0; i < _childrenLength; i++) {
        let children = _document[i];
        _placeMap.push({
          name: children.name,
          x: children.absoluteBoundingBox.x,
          y: children.absoluteBoundingBox.y,
          componentId: children.componentId,
        });
      }

      return _placeMap;
    })
    .then((res) => {
      let _placeMap = res;

      Promise.all(
        res.map((i, index) => {
          return fetch(
            `https://api.figma.com/v1/images/${KEY}?ids=${encodeURIComponent(
              i.componentId
            )}&format=svg`,
            {
              method: "GET",
              headers: {
                "x-figma-token": TOKEN,
              },
            }
          )
            .then((iRes) => iRes.json())
            .then(
              (iRes) => (_placeMap[index].image = iRes.images[i.componentId])
            );
        })
      ).then(() => {
        for (let i = 0; i < _placeMap.length; i++) {
          let children = _placeMap[i];

          fetch(children.image)
            .then((aRes) => aRes.text())
            .then((aRes) => {
              let div = document.createElement("div");
              div.style.setProperty("--y", `${children.y}px`);
              div.style.setProperty("--x", `${children.x}px`);

              if (children.name === "Water") {
                div.classList.add("water");
                div.style.setProperty("z-index", "1");
              } else if (children.name === "Sky") {
                div.classList.add("sky");
                div.style.setProperty("z-index", "2");
              } else if (children.name === "Stars") {
                div.classList.add("stars");
                div.style.setProperty("z-index", "3");
              } else if (children.name === "Mountains") {
                div.classList.add("mountains");
                div.style.setProperty("z-index", "4");
              } else if (children.name === "Triangle Trees") {
                div.classList.add("triangle-trees");
                div.style.setProperty("z-index", "5");
              } else if (children.name === "Trees") {
                div.classList.add("trees");
                div.style.setProperty("z-index", "6");
              } else if (children.name === "Boat") {
                div.classList.add("boat");
                div.style.setProperty("z-index", "7");
              } else if (children.name === "Leafs") {
                div.classList.add("leafs");
                div.style.setProperty("z-index", "8");
              }

              div.innerHTML = aRes;
              scene.appendChild(div);
            })
            .then(() => {
              if (i === _placeMap.length - 1) {
                // Spinner -> Off
                spinner.setAttribute("data-animation", "off");

                body.classList.add("scene-mode");
              }
            })
            .then(() => animate_scene());
        }
      });
    })
    .catch(() => {
      // Spinner -> Off
      spinner.setAttribute("data-animation", "off");

      alert(
        "There is some error while fetching the file ...Maybe, the Figma API service is temporarily unavailable 😩 — See console for more details 🥴"
      );
    });
});

// FULL-SCREEN BUTTON
// ------------------------------------------------
fullscreen.addEventListener("click", (e) => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
});

// CLOSE BUTTON
// ------------------------------------------------
close.addEventListener("click", (e) => {
  body.classList.remove("scene-mode");
});

// Scene Size Setup
// ------------------------------------------------
function check_scene_size() {
  let scene_size = scene.getBoundingClientRect();
  if (scene_size.width < window.innerWidth) {
    body.style.overflowX = "hidden";
  } else {
    body.style.overflowX = "auto";
  }
  if (scene_size.height < window.innerHeight) {
    body.style.overflowY = "hidden";
  } else {
    body.style.overflowY = "auto";
  }
  scene.scrollIntoView({
    block: "center",
    inline: "center",
  });
}

// SCALE BUTTONS
// ------------------------------------------------
small.addEventListener("click", () => {
  scene.style.transform = `scale(.25) translateX(-58%)`;
  check_scene_size();
});

half.addEventListener("click", () => {
  scene.style.transform = `scale(.5) translateX(-29%)`;
  check_scene_size();
});

original.addEventListener("click", () => {
  scene.style.transform = `scale(1)`;
  check_scene_size();
});

// WINDOW RESIZE
// ------------------------------------------------
window.addEventListener("resize", check_scene_size);
