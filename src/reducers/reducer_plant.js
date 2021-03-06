import {ADD_PLANT, REMOVE_PLANT, RENAME_PLANT} from "../plant_constants";

export default function (state = {plants: []}, action) {
    const {plants} = state;
    let plant = null;
    let idx = -1;
    let plantArray = null;
    switch (action.type) {
        case ADD_PLANT:
            plant = action.plant;
            plantArray = plants.slice();
            plantArray.push(plant);
            return Object.assign({}, state, {
                plants: plantArray
            });
        case REMOVE_PLANT:
            plant = action.plant;
            idx = plants.map(x => x.id).indexOf(plant.id);
            plantArray = plants.filter((plant, index) => index !== idx);
            return Object.assign({}, state, {
                plants: plantArray
            });
        case RENAME_PLANT:
            plant = action.plant;
            idx = plants.map(x => x.id).indexOf(plant.id);
            plantArray = plants.slice();
            plantArray[idx].name = action.name;
            return Object.assign({}, state, {
                plants: plantArray
            });
        default:
            return state;
    }
}
