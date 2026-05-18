import axiosInstance from './axiosInstance'
import { getCached } from './cache'

// Launch Library 2 — actively maintained, data current through 2026
const LL2 = 'https://ll.thespacedevs.com/2.3.0'
// SpaceX agency ID = 121 in LL2 — lsp__id is the only working filter in v2.3.0
const SpX = 'lsp__id=121'

// r-spacex API — kept only for static rocket specs
const SPACEX_API = 'https://api.spacexdata.com/v4'

const MIN = 60 * 1000
const HR  = 60 * MIN

export const getUpcomingLaunches = () =>
  getCached('upcoming', 60 * MIN, async () => {
    const { data } = await axiosInstance.get(
      `${LL2}/launches/upcoming/?${SpX}&limit=20&ordering=net&format=json`
    )
    return data.results
  })

export const getPastLaunches = (limit = 50, offset = 0) =>
  getCached(`past-${limit}-${offset}`, 60 * MIN, async () => {
    const { data } = await axiosInstance.get(
      `${LL2}/launches/previous/?${SpX}&limit=${limit}&offset=${offset}&ordering=-net&format=json`
    )
    return data
  })

export const getRockets = () =>
  getCached('rockets', 6 * HR, async () => {
    const { data } = await axiosInstance.get(`${SPACEX_API}/rockets`)
    return data
  })

export const getStarship = () =>
  getCached('starship', 6 * HR, async () => {
    const { data } = await axiosInstance.post(`${SPACEX_API}/rockets/query`, {
      query: { name: 'Starship' },
      options: { limit: 1 },
    })
    return data.docs[0]
  })
