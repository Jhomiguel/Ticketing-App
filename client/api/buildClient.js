import axios from 'axios';

//dev url
//http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

export default function buildClient({ req }) {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://www.ticketing-ecommerce-app.xyz',
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseURL: '/',
    });
  }
}
