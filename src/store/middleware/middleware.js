import {stringify as queryStringify} from "query-string";
import {history} from "../../index";
import {
  fieldsStringToInt,
  sponsorStringToInt,
  topicStringToInt
} from "../utility";

export const updateUrl = store => next => action  => {
    const result = next(action)
    const newState = store.getState().main
    console.log(newState)
    let newUrlData = {
      g: newState.graph,
      f: newState.filter[0].value,
      t: newState.filter[1].value,
      s: newState.filter[2].value,
      sP: newState.selectedProject
    }

    let minifiedUrlData = {
      ...newUrlData,
      t: newUrlData.t.map(f => topicStringToInt(f)),
      f: newUrlData.f.map(t => fieldsStringToInt(t)),
      s: newUrlData.s.map(s => sponsorStringToInt(newState, s))}
    const newUrl = '?' + queryStringify(minifiedUrlData)
    console.log(newUrl)
    if(newUrl !== window.location.search){
      history.push(newUrl)
    }

    return result
}

export const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

