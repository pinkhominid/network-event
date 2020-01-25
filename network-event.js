export const NETWORK_EVENT = 'network-event';
export const PENDING_STATE = 'pending';
export const COMPLETE_STATE = 'complete';

const origFetch = fetch;
fetch = function(resource, init) {
  const url = resource.url || resource;
  dispatchPending(url);
  return origFetch.apply(this, arguments).then(
    origResp => {
      const resp = origResp.clone(); // clone so we can consume text stream w/o affecting orig
      dispatchComplete(
        resp.url,
        resp.status,
        resp.headers.get('content-type'),
        async () => resp.text(),
        async () => resp.json()
      );
      return origResp;
    },
    err => {
      dispatchComplete(url, 0, err.toString());
      return Promise.reject(err);
    }
  );
};

const xhrProto = XMLHttpRequest.prototype;
const origOpen = xhrProto.open;
const origSend = xhrProto.send;
xhrProto.open = function(method, url) {
  this._requestURL = url; // save url so we can retrieve it in send
  origOpen.apply(this, arguments);
};
xhrProto.send = function() {
  dispatchPending(this._requestURL);
  this.addEventListener('loadend', () => {
    const url = this.responseURL || this._requestURL;
    dispatchComplete(
      url,
      this.status,
      this.getResponseHeader('content-type'),
      async () => Promise.resolve(this.response),
      async () => Promise.resolve(JSON.parse(this.response))
    );
  }, { once: true });
  origSend.apply(this, arguments);
};

function dispatchPending(url) {
  dispatch({ state: PENDING_STATE, url: absUrl(url) });
}

function dispatchComplete(url, status, contentType, text, json) {
  dispatch({
    state: COMPLETE_STATE,
    url: absUrl(url),
    status,
    'content-type': contentType,
    text,
    json
  });
}

function dispatch(detail) {
  const event = new CustomEvent(NETWORK_EVENT, { detail });
  dispatchEvent(event);
}

function absUrl(url) {
  return (new URL(url, location)).toString();
}
