import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
	vus: 5000,
	duration: '30s',
};

export default function () {
	  http.get('http://localhost:3005/products?page=1&count=1000');
		// http.get('http://localhost:3005/products/1');
}

