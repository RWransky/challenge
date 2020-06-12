# Pacman Technical Challenge

Typescript & React implementation of the popular arcade game Pacman.

Currently pacman uses [A, S, W, D] keys for moving.

# Setup and Running •̮ ̮•
This webapp uses `Docker` to create a standard development image and `docker-compose` to run the image in a container.

## Build

- `docker-compose build`

## Run

- Starting the client server: `docker-compose up -d`
- Attaching to log output: `docker-compose logs -f`
- If the development server starts successfully go to `localhost:3000` to view the webapp.

# Auto-Play Algorithm ᕕ( ͡° ͜ʖ ͡° )ᕗ
Pacman walks along the map by prioritizing reward and map completion, all while trying to avoid the ghosts [O.o]. He does this by:
- calculating exploration value. This is done by keeping track of where he has been so to know what direction leads to most likely locations for new biscuits.
- looking ahead and side-to-side to see what rewards are there. Since he doesn't have eyeballs on the back of his head anything behind him is set as 0 reward value, but he still has the option to go that way.
- avoiding ghosts if present and he's not invincible.
If there is a tie in rewards then movement decision is decided by exploration value. If exploration value is also tied, a random choice is taken.

To try the auto-play algorithm click on the "Start 100 Automated Games" button in the UI! ٩(^ᴗ^)۶

# ◔̯◔ Current Shortcomings (－‸ლ)

- Testing is not integrated when building the Docker image or starting the server. Ideally we'd run tests automatically prior to starting the container.
- Implementing the autoplay feature introduced a small bug in the manual play mode where Pacman moves to the right at first.
- The auto-play algorthim's path optimizing calculations are based on an average which results in Pacman sometimes bouncing between two locations for a bit. Randomizing the movement at this stage sort of solves the problem but it still persists.


# Instructions

## Tasks

- Create a way to automate Pacman's moves in `src/lib/game/Pacman.ts` such that Pacman can achieve the highest score.
- Add a button that will run 100 iterations using the new automated algorithm
- Take note of any architectural problems for further discussion

## Rules

- "Looking" is defined by examining the `this.items` elements. See `findItem` method of `src/lib/game/Item.ts` for an example
- Pacman can only look ahead and side to side (he can not look behind him).
- Pacman can not look through walls
- Do not alter the Ghosts' behavior
- Do not alter the scoring rules
- Be creative
