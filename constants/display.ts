export const DEFAULT_CARD_WIDTH = 70
export const DEFAULT_CARD_HEIGHT = 140

export const HORIZONTAL_SPRITE_COUNT = 7
export const VERTICAL_SPRITE_COUNT = 4
export const DOMINO_SPRITE_MAPPING = {
  '0|0': [0, 0],
  '0|1': [-1, 0],
  '0|2': [-2, 0],
  '0|3': [-3, 0],
  '0|4': [-4, 0],
  '0|5': [-5, 0],
  '0|6': [-6, 0],
  '1|1': [0, -1],
  '1|2': [-1, -1],
  '1|3': [-2, -1],
  '1|4': [-3, -1],
  '1|5': [-4, -1],
  '1|6': [-5, -1],
  '6|6': [-6, -1],
  '2|2': [0, -2],
  '2|3': [-1, -2],
  '2|4': [-2, -2],
  '2|5': [-3, -2],
  '2|6': [-4, -2],
  '5|5': [-5, -2],
  '5|6': [-6, -2],
  '3|3': [0, -3],
  '3|4': [-1, -3],
  '3|5': [-2, -3],
  '3|6': [-3, -3],
  '4|4': [-4, -3],
  '4|5': [-5, -3],
  '4|6': [-6, -3],
}

export enum PLAYER_INFO_POSITION {
  right,
  top,
  left,
  bottom,
}

export enum CARD_DIRECTION {
  right,
  left,
}
