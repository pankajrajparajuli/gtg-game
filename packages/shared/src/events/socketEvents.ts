export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  START_GAME: "start_game",
  DRAW_EVENT: "draw_event",
  CLEAR_CANVAS: "clear_canvas",
  SEND_MESSAGE: "send_message",

  // Server -> Client
  ROOM_UPDATED: "room_updated",
  GAME_STARTED: "game_started",
  TURN_STARTED: "turn_started",
  DRAW_UPDATE: "draw_update",
  CANVAS_CLEARED: "canvas_cleared",
  GUESS_RESULT: "guess_result",
  MESSAGE_BROADCAST: "message_broadcast",
  TIMER_UPDATE: "timer_update",
  GAME_ENDED: "game_ended",
} as const;