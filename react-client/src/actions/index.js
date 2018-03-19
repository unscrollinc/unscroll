import * as types from '../constants/actionTypes';

export const makeNoteFromEvent = (o) => ({
    type: types.NOTE_MAKE_FROM_EVENT, o
});
