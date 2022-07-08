kaboom({
  global: true,
  fullscreen: true,
  clearColor: [0, 0.5, 1, 1],
  debug: true,
  scale: 2,
});
loadRoot("./sprites/");
loadSprite("mario", "mario.png");
loadSprite("block", "ground.png");
loadSprite("coin", "coin.png");
loadSprite("surprise", "surprise.png");
loadSprite("goomba", "evil_mushroom.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("cloud", "cloud.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("coin", "coin.png");
loadSprite("pipe", "pipe_up.png");
loadSprite("castle", "castle.png");
loadSprite("pipe2", "pipe2.png");

loadSound("gamesound", "gameSound.mp3");
loadSound("jumpsound", "jumpSound.mp3");
scene("start", () => {
  add([
    text("start game", 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  keyDown("enter", () => {
    go("game");
  });
});

scene("vacation", (score) => {
  add([
    text("game over\nScore: " + score + "\nmad by Majdm", 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  wait(3, () => {
    go("start");
  });
});
scene("win", (score) => {
  add([
    text("winer \n Score: " + score, 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  wait(6, () => {
    go("start");
  });
});

scene("game", () => {
  play("gamesound");
  layers(["bg", "obj", "ui"], "obj");
  let isJumping = false;
  const symbolMap = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid(), scale(1.3)],
    "*": [sprite("surprise"), solid(), "coin-surprise"],
    "!": [sprite("surprise"), solid(), "mushroom-surprise"],
    "+": [sprite("cloud"), layer("bg"), scale(3)],
    "&": [sprite("castle"), layer("bg"), scale(2)],
    $: [sprite("coin"), "coin"],
    M: [sprite("mushroom"), body(), "mushroom"],
    G: [sprite("goomba"), body(), solid(), "goomba"],
    x: [sprite("unboxed"), solid()],
    P: [sprite("pipe"), solid()],
    p: [sprite("pipe2"), solid(), "p"],
  };
  const map = [
    "                                          +                                       ",
    "  +                    +       +              +       +            +              ",
    "             +                        +                           +         +     ",
    "       +          +                                       +                       ",
    "  +                           +        +          + +               +        +    ",
    "           +             +                +                 +                +    ",
    "              & +                                               &     +           ",
    "                       +             +                 +           +      +       ",
    "        =*=      !                                                                ",
    "         G                          =   =                                         ",
    "      ==*==!=   ===                ==   ==                                        ",
    "                        P         ===   ===       P                               ",
    "              G              G   ==== G ====                        G           p ",
    "========================================================  !  =====================",
    "========================================================= G ======================",
    "==================================================================================",
    "==================================================================================",
  ];
  const speed = 120;
  const jumpforce = 400;
  let jn = 0;
  const falldown = 500;
  let goombaSpeed = -20;
  let score = 0;
  const scorelabel = add([
    text("Score" + score),
    pos(50, 10),
    layer("ui"),
    {
      value: score,
    },
  ]);
  const player = add([
    sprite("mario"),

    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(jumpforce),
  ]);

  keyDown("right", () => {
    player.move(speed, 0);
  });

  keyDown("left", () => {
    if (player.pos.x > 10) player.move(-speed, 0);
  });

  keyPress("space", () => {
    if (player.grounded()) {
      player.jump(jumpforce);
      isJumping = true;
      // keyDown("space", () => {
      //   player.move(0, -20);
      // });
    }
    jn = 0;
  });

  const gameLevel = addLevel(map, symbolMap);

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("x", obj.gridPos);
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("M", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("x", obj.gridPos);
    }
  });
  player.collides("coin", (x) => {
    destroy(x);
    scorelabel.value += 3;
    scorelabel.text = "Score: " + scorelabel.value;
  });

  player.collides("mushroom", (x) => {
    destroy(x);
    player.biggify(5);
    scorelabel.value += 10;
    scorelabel.text = "Score: " + scorelabel.value;
  });

  player.collides("goomba", (obj) => {
    if (isJumping) {
      destroy(obj);
      scorelabel.value += 5;
      scorelabel.text = "Score: " + scorelabel.value;
    } else {
      if (player.isBig()) {
        player.smallify();
        destroy(obj);
        scorelabel.value += 5;
        scorelabel.text = "Score: " + scorelabel.value;
      } else {
        destroy(player);
        go("vacation", scorelabel.value);
      }
    }
  });
  loop(3, () => {
    goombaSpeed = goombaSpeed * -1;
  });
  action("mushroom", (mush) => {
    mush.move(60, 0);
  });

  action("goomba", (x) => {
    x.move(goombaSpeed, 0);
  });
  player.action(() => {
    camPos(player.pos.x, 200);
    scorelabel.pos.x = player.pos.x - 400;
    if (player.pos.y >= falldown) {
      go("vacation", scorelabel.value);
    }
    if (player.grounded() == false) {
      isJumping = true;
    } else {
      isJumping = false;
    }
  });
  player.collides("p", (x) => {
    go("win", scorelabel.value);
  });
});
start("start");
