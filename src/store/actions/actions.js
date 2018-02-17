import * as actionTypes from './actionTypes'

// action emitters to keep the containers clean

export const changeGraph = (value) => {
  return {
    type: actionTypes.CHANGE_GRAPH,
    value: value
  }
}

export const filterChange = (filterId, value, form) => {
  return {
    type: actionTypes.FILTER_CHANGE,
    id: filterId,
    value: value,
    form: form
  }
}

export const toggleAllFilters = (key, filters) => {
  return {
    type: actionTypes.TOGGLE_FILTERS,
    key: key,
    filters: filters
  }
}

export const activatePopover = (datapoint) => {
  return {
    type: actionTypes.ACTIVATE_POPOVER,
    element: datapoint
  }
}
