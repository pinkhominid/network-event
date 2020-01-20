# Network Listener

Browser network listener

```js
import { EVENT_TYPE } from './network-listener.js';

window.addEventListener(EVENT_TYPE, e => {
  console.log(EVENT_TYPE, e.detail);
});

fetch('https://jsonplaceholder.typicode.com/users');

const req = new XMLHttpRequest();
req.open('get', 'https://jsonplaceholder.typicode.com/users');
req.send();
```
