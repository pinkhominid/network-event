/* TODO
 * - make sure timeouts work
 * - safeguard against non-text responses
 * - make dispatcher pluggable
 */

export const EVENT_TYPE = 'network-request-state-change';
export const PENDING_STATE = 'pending';
export const COMPLETE_STATE = 'complete';

const origFetch = fetch;
fetch = function(resource, init) {
  const url = resource.url || resource;
  dispatchPending(url);
  return origFetch.apply(this, arguments).then(
    async origResp => {
      const resp = origResp.clone(); // clone so we can consume text stream w/o affecting orig
      dispatchComplete(resp.url, resp.status, await resp.text());
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
    dispatchComplete(url, this.status, this.response)
  }, { once: true });
  origSend.apply(this, arguments);
};

function dispatchPending(url) {
  dispatch({ state: PENDING_STATE, url: absUrl(url) })
}

function dispatchComplete(url, status, responseText) {
  dispatch({ state: COMPLETE_STATE, url: absUrl(url), status, responseText })
}

function dispatch(detail) {
  const event = new CustomEvent(EVENT_TYPE, { detail });
  dispatchEvent(event);
}

function absUrl(url) {
  return (new URL(url, location)).toString();
}
