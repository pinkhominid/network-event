# Network Event

A global normalized event for browser network requests (fetch & XHR).

```js
import { NETWORK_EVENT, PENDING_STATE, COMPLETE_STATE } from './network-event.js';

window.addEventListener(NETWORK_EVENT, async e => {
  switch (e.detail.state) {
    case PENDING_STATE: console.log(e.detail); break;
    case COMPLETE_STATE: console.log(e.detail, await e.detail.json()); break;
  }
});

fetch('https://jsonplaceholder.typicode.com/users');

const req = new XMLHttpRequest();
req.open('get', 'https://jsonplaceholder.typicode.com/users');
req.send();
```

```sh
Object { state: "pending", url: "https://jsonplaceholder.typicode.com/users" }

Object { state: "pending", url: "https://jsonplaceholder.typicode.com/users" }

Object { state: "complete", url: "https://jsonplaceholder.typicode.com/users", status: 200, "content-type": "application/json; charset=utf-8", text: send(), json: send() }
Array(10) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]

Object { state: "complete", url: "https://jsonplaceholder.typicode.com/users", status: 200, "content-type": "application/json; charset=utf-8", text: fetch(), json: fetch() }
Array(10) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
```
