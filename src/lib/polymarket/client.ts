import axios from 'axios'
import { GAMMA_API_URL } from './config'

export const gammaClient = axios.create({
  baseURL: GAMMA_API_URL,
  timeout: 30000,
})
