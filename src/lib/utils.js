const bs58 = require('bs58')
const axios = require('axios')

const {dropLast, last, trim, isNil, isEmpty, pipe, addThen: then} = require('ramda')
const {CHATBOT_API_ENDPOINT, API_ENDPOINT} = require('./config')

function base58EncodePayloadToString(payload) {
  var {budget, scenarios, pids} = payload

  var budgetStr =
    isNil(budget) || isEmpty(budget) || isNaN(budget)
      ? 'undefined'
      : String(budget)
  var scenariosStr =
    isNil(scenarios) || isEmpty(scenarios) ? '' : scenarios.join(',')
  var pidsStr = isNil(pids) || isEmpty(pids) ? '' : pids.join(',')
  return `${budgetStr}:${scenariosStr}:${pidsStr}`
}

function base58EncodeUrl(payload) {
  return base58encode(base58EncodePayloadToString(payload))
}

function base58encode(text) {
  return bs58.encode(Buffer.from(text))
}

// transformHashStringToPayload :: String -> {budget: Float, scenarios: [String], pids: [String]}
function transformHashStringToPayload(hashString) {
  const decodeString = bs58.decode(hash)
  const [budget, scenarios, pids] = decodeString.toString().split(':')
  return {
    budget: parseFloat(budget),
    scenarios: scenarios.split(','),
    pids: pids.split(',')
  }
}

// transformInputArrayToPayload :: (dataset:: match dataset include keyword set) -> [keyword] -> {budget, scenarios, pids, kwlist}
function transformInputArrayToPayload(dataset, [checkBudget, ...rest]) {
  if (checkBudget === undefined) {
    return {budget: undefined, scenarios: [], pids: [], kwlist: []}
  }

  if ((rest === undefined) || (rest.length === 0)) {
    return {budget: parseInt(checkBudget), scenarios: [], pids: [], kwlist: []}
  }

  var {scenarios: checkScenarios, cards: checkCards} = dataset
  // var result = {budget: parseInt(checkBudget), scenarios: [], pids: []}
  mockList = [...checkScenarios, ...checkCards]  //?
  var scenarios = []
  var pids = []
  var kwlist = []

  mockList.forEach(d => {
    if ((d.kw !== undefined) && (d.kw !== '')) {
      d.kw.trim().split(',')
        .forEach(d1 => {
          // concat condition
          rest.forEach(d2 => {
            // console.log('d2', d2, 'd1', d1)
            if (/^S/.test(d.uid) && (d2 !== undefined) && (d2.toLowerCase() === d1.toLowerCase())) {
              scenarios = [...scenarios, d.uid]
              kwlist = [...kwlist, d2]
            }
            if (/^C/.test(d.uid) && (d2 !== undefined) && (d2.toLowerCase() === d1.toLowerCase())) {
              pids = [...pids, d.uid]
              kwlist = [...kwlist, d2]
            }
          })
        })
    }
  })

  return {budget: parseInt(checkBudget), scenarios, pids, kwlist}
}

function arrangeStringList(list, acc) {
  var [start, ...rest] = list
  list
  if (list.length !== 0) {
    // check combine condition
    var regEng = new RegExp(/[a-z]*\s?[a-z]+/)
    var separatorEng = ' '
    if (regEng.test(start) && (regEng.test(last(acc)))) {
      var combineAcc = (acc.length !== 0) ? acc[acc.length - 1] + separatorEng + trim(start) : trim(start)
      return arrangeStringList(rest, [...dropLast(1, acc), combineAcc])
    }

    return arrangeStringList(rest, [...acc, trim(start)])
  } else {
    return acc
  }
}

// transformInputToFilterArray :: string -> [keyword]
function transformInputToFilterArray(string) {
  if (string === '') {
    return []
  } else {
    return arrangeStringList(string.split(' '), [])
  }
}

function transfromFilterArrayToInputArray(list) {
  var ischeck = false
  var result = [undefined]
  var regBudget = new RegExp(/^\d+$/)
  list.forEach(d => {
    if (regBudget.test(d)) {
      if (ischeck === false) {
        result[0] = parseInt(d)
        isCheck = true
      }
    } else {
      result = [...result, d]
    }
  })

  if (result[0] === undefined) {
    return []
  }

  return result
}

async function fetchAPIResponse(payload) {
  let {budget, scenarios, pids} = payload
  // it should get hashUrl
  if (budget === undefined || budget === 0) return []
  let resp = await axios.get(`${API_ENDPOINT}/?q=${base58EncodeUrl(payload)}`)
  let data = resp.data.data
  return data
}

async function getChatbotTrees() {
  let {data} = await axios.get(CHATBOT_API_ENDPOINT)
  return data
}

module.exports = {
  base58EncodeUrl,
  transformInputToFilterArray,
  transfromFilterArrayToInputArray,
  transformInputArrayToPayload,
  fetchAPIResponse,
  getChatbotTrees,
}