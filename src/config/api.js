export const API = {
  base: import.meta.env.VITE_API_URL || 'https://api.open-meteo.com/v1',
  lista: '/forecast?latitude=16.9068&longitude=-92.0933&daily=temperature_2m_max,temperature_2m_min&timezone=auto',
  detalle: (id) => `/forecast?latitude=16.9068&longitude=-92.0933&current_weather=true&start_date=${id}&end_date=${id}&timezone=auto`,
};