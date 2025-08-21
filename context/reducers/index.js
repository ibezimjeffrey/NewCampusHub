import {combineReducers} from "redux"
import UserAuthReducer from "./userAuthReducer"

const myReducer = combineReducers({
    user: UserAuthReducer
})

export default myReducer;