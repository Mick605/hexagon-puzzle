# Hexagon Puzzle
This is a web-based implementation of a puzzle game involving hexagonal tokens. The objective of the game is to place the tokens in such a way that the sums of the values of the tokens in each row on the hexagonal game board equal 38.

## How to Play
To play the game, simply drag and drop the hexagonal tokens onto the game board. The hexagonal board is composed of 15 rows, each of which has a target sum of 38. The sum of the values of the tokens placed in each row is displayed on a counter at the end of each row. If the sum is 38, the counter turns green; if the sum is greater than 38, the counter turns blue; and if the sum is less than 38, the counter turns red. The objective of the game is to place the tokens in such a way that all of the counters turn green.

## Implementation Details
This implementation of the hexagon puzzle is built using web components and follows the shadow DOM pattern to encapsulate the implementation details of each component. The implementation uses local storage to save the state of the game and the browser's history API to allow the user to undo and redo moves.

## How to Run
To run the project, simply serve this folder and open it in a web browser.

A demo version is hosted on Github Pages: https://mick605.github.io/hexagon-puzzle/