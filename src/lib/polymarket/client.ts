import axios from 'axios'
import { DATA_API_URL, GAMMA_API_URL, LB_API_URL, USER_PNL_API_URL } from './config'

export const gammaClient = axios.create({
  baseURL: GAMMA_API_URL,
  timeout: 30000,
})
export const dataClient = axios.create({
  baseURL: DATA_API_URL,
  timeout: 30000,
})

export const userPnlClient = axios.create({
  baseURL: USER_PNL_API_URL,
  timeout: 30000,
})

export const lbClient = axios.create({
  baseURL: LB_API_URL,
  timeout: 30000,
})

