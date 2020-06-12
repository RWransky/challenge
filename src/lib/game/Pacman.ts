import { GameBoardItemType, KeyToGameDirection, GameDirectionMap, GameDirectionToKeys, ReverseGameDirection, GameDirection, pillMax } from '../Map';
import Item from './Item';

class Pacman extends Item implements GameBoardItem {

  type:GameBoardItemType = GameBoardItemType.PACMAN;

  desiredMove: string | false = false;

  score:number = 0;

  tracks:number[][] = [];

  constructor(piece:GameBoardPiece, items:GameBoardItem[][], pillTimer:GameBoardItemTimer) {
    super(piece, items, pillTimer);

    // Bind context for callback events
    this.handleKeyPress = this.handleKeyPress.bind(this);

    // Add a listener for keypresses for this object
    window.addEventListener('keypress', this.handleKeyPress, false);

  }

  /**
   * Sets the initiial X,Y track
   * 
   * @method initTracks
   * @param {GameBoardPiece} piece Current Piece the item is to be on
   */
  initTracks(piece:GameBoardPiece): void {
    this.tracks.push([piece.y,piece.x]);
  }

  /**
   * Handle a keypress from the keyboard
   * 
   * @method handleKeyPress
   * @param {KeyboardEvent} e Input event
   */
  handleKeyPress(e: KeyboardEvent): void {

    if (KeyToGameDirection[e.key.toUpperCase()]) {
      this.desiredMove = KeyToGameDirection[e.key.toUpperCase()];
    }

  }
  
  /**
   * Returns the next move from the keyboard input
   * 
   * @method getNextKeyMove
   * @return {GameBoardItemMove | boolean} Next move
   */
  getNextKeyMove(): GameBoardItemMove | boolean {
    const { moves } = this.piece;
    let move: GameBoardItemMove | false = false;

    // If there is a keyboard move, use it and clear it
    if (this.desiredMove) {    
      if (moves[this.desiredMove]) {
        move = {piece: moves[this.desiredMove], direction: GameDirectionMap[this.desiredMove]};
        this.desiredMove = false;
      }
    }
    
    // Otherwise, continue in the last direction
    if (!move && this.direction !== GameDirection.NONE) {
      const key = GameDirectionToKeys(this.direction);
      if (moves[key]) {
        move = {piece: moves[key], direction: this.direction};
      }
    }

    return move;

  }

  /**
   * Can Pacman eat ghosts?
   *
   * @method canEatGhosts
   * @return {boolean} Pacman can/cannot eat ghosts
   */
  canEatGhosts(): boolean {
    return (this.pillTimer.timer || 0) > 0
  }

  /**
   * Find next move based on most unexplored region
   *
   * @method pickMove
   * @param {GameBoardItemMove[]} choices
   * @return {GameBoardItemMove} next move
   */
  pickMove(choices: GameBoardItemMove[]): GameBoardItemMove {
    /* Save the average distance to tracks and rewards at position */
    let avgDistances: number[] = [];
    let rewards: number[] = [];
    let keptChoices: GameBoardItemMove[] = [];
    for (let i=0; i<choices.length; i++) {
      let dists: number[] = [];
      for (let j=0; j<this.tracks.length; j++) {
        let xDiff = choices[i].piece.x - this.tracks[j][1];
        let yDiff = choices[i].piece.y - this.tracks[j][0];
        dists.push(Math.sqrt( xDiff*xDiff + yDiff*yDiff ));
      }

      /* If direction is behind Pacman we can't determine the exact reward or object */
      if (choices[i]['direction'] !== ReverseGameDirection(this.direction)){
        const ghost = this.nextItemFound(choices[i].piece,GameBoardItemType.GHOST);
        if (!ghost){
          rewards.push(
            this.items[choices[i]['piece']['y']][choices[i]['piece']['x']].type);
          
          keptChoices.push(choices[i]);
          avgDistances.push(Math.round(dists.reduce((a,b) => a + b, 0) / dists.length));
        } else {
          if (this.canEatGhosts()){
            rewards.push(
              this.items[choices[i]['piece']['y']][choices[i]['piece']['x']].type);
            
            keptChoices.push(choices[i]);
            avgDistances.push(Math.round(dists.reduce((a,b) => a + b, 0) / dists.length));
          }
        }
      } else {
        rewards.push(0);
        avgDistances.push(Math.round(dists.reduce((a,b) => a + b, 0) / dists.length));
        keptChoices.push(choices[i]);
      }
      
    }
    /* Prioritize which move has greatest value: first by reward, then by distance */

    const indexesOf = (arr:number[], item:number) => 
      arr.reduce(
        (acc:number[], v:number, i:number) => (v === item && acc.push(i), acc),
      []);

    let idx = indexesOf(rewards, Math.max(...rewards));

    if (idx.length > 1){
      let distSubset = idx.map(i => avgDistances[i]);
      let distIdx = indexesOf(distSubset, Math.max(...distSubset));
      if (distIdx.length > 1){
        /* Multiple options of equal value exist, just pick randomly */
        return keptChoices[idx[Math.floor(Math.random() * Math.floor(idx.length))]];
      } else {
        /* Pick the route that has the higher value */
        return keptChoices[idx[distIdx[0]]];
      }
    } else {
      return keptChoices[idx[0]];
    }

  }

  /**
   * Returns the next move for auto PacMan
   * 
   * @method getNextAutoMove
   * @return {GameBoardItemMove | boolean} Next move
   */
  getNextAutoMove(): GameBoardItemMove | boolean {

    const { moves } = this.piece;

    /* Let's compile a list of possible moves */
    let choices:GameBoardItemMove[] = [];

    /* Possible directions available to Pacman */
    const possibleDirections = Object.keys(moves);

    /* Iterate over possible moves */
    for (const direction in Object.keys(moves)) {
      choices.push({piece: moves[possibleDirections[direction]], 
          direction: possibleDirections[direction]});
    }
    /* If there are no available choices, return false */
    if (choices.length === 0){
      return false;
    }

    /* Pick whichever option leads to the most unexplored region */

    return this.pickMove(choices);


  }

  /**
   * Allows an item to look once in a single direction for another item
   * 
   * @method nextItemFound
   * @param {GameBoardPiece} currentPiece Game board piece
   * @param {GameBoardItemType} typeToFind Type of item being looked for
   * @return {GameBoardItem | false} Item found
   */
  nextItemFound(currentPiece: GameBoardPiece, typeToFind: GameBoardItemType): boolean {
    if (currentPiece){
      const item = this.items[currentPiece.y][currentPiece.x];
      if (typeof item !== 'undefined') {
        const { type } = item;
        if (type === typeToFind) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Move Pacman and "eat" the item
   * 
   * @method move
   * @param {GameBoardPiece} piece 
   * @param {GameDirection} direction 
   */
  move(piece: GameBoardPiece, direction: GameDirection):void {
    const item = this.items[piece.y][piece.x];
    if (typeof item !== 'undefined') {
      this.score += item.type;
      switch(item.type) {
        case GameBoardItemType.PILL:
          this.pillTimer.timer = pillMax;
          break;
        case GameBoardItemType.GHOST:
          if (typeof item.gotoTimeout !== 'undefined')
            item.gotoTimeout();
          break;
        default: break;
      }
    }
    this.setBackgroundItem({ type: GameBoardItemType.EMPTY });
    this.fillBackgroundItem();

    this.setPiece(piece, direction);
    this.items[piece.y][piece.x] = this;
    if (!this.tracks.includes([piece.y,piece.x])){
      this.tracks.push([piece.y,piece.x]);
    }
    
  }

}

export default Pacman;