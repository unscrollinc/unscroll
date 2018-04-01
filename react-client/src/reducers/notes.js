import { NOTE_MAKE, NOTE_MAKE_FROM_EVENT } from '../constants/actionTypes'

const initialState = [{waffles: 'waffles'}];

const notes = (state = initialState, action) => {
    console.log(initialState, action);
    switch (action.type) {
        case NOTE_MAKE:
            return [...state, {a: 0}];
        case NOTE_MAKE_FROM_EVENT:
            console.log('YEAH OKAY');
            return [...state, {b: 1}];
        default:
            return state;
    }
}

export default notes;