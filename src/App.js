import {useState, useEffect, useMemo} from 'react';

import logo from './logo.svg';
import './App.css';

const thisUrl = new URL(window.location.href);
const urlParam = thisUrl.searchParams.get('url');

const initialString = urlParam || window.location.href;
const initialUrlState = {
  string: initialString,
  url: new URL(initialString),
  lastEngage: ''
};

const buildSearchParams = (entries) => {
  const sp = new URLSearchParams();
  for (const entry of entries) {
    sp.set(entry.key, entry.value);
  }
  return sp;
};

function SearchParamDisplay(props = {}) {
  const {searchParams, setSearchParams} = props;
  
  const entries = useMemo(() => {
    const e = [];
    searchParams.forEach((value, key) => {
      e.push({key, value});
    });
    return e;
  }, [searchParams]);
  
  const onChange = (event) => {
    const {index, type} = event.target.dataset;
    const newEntries = entries.slice();
    newEntries[index][type] = event.target.value;
    const sp = buildSearchParams(newEntries);
    setSearchParams(sp);
  };

  const removeParamAtIndex = (event) => {
    const {index} = event.target.dataset;
    const newEntries = entries.slice();
    newEntries.splice(index, 1);
    const sp = buildSearchParams(newEntries);
    setSearchParams(sp);
  };

  const addParam = () => {
    const newEntries = entries.slice();
    newEntries.push({
      key: '',
      value: ''
    });
    const sp = buildSearchParams(newEntries);
    setSearchParams(sp);
  };

  return (
    <>
      <div className="field">
        <div className="field-name">
          SearchParams
          <button type="button" onClick={addParam}>Add +</button>
        </div>
      </div>
      <div id="searchparams">
        {
          entries.map(({key, value}, idx) => (
            <div className="searchparams-entry" key={`searchparam-${idx}`}>
              <div>
                Key
              </div>
              <input
                type="text"
                value={key}
                data-index={idx}
                data-type="key"
                onChange={onChange}
                style={{ flexShrink: 2 }}
              />
              <div>
                Value
              </div>
              <input
                type="text"
                value={value}
                data-index={idx}
                data-type="value"
                onChange={onChange}
              />
              <button type="button" data-index={idx} onClick={removeParamAtIndex}>X</button>
            </div>  
          ))
        }
      </div>
    </>
  )
}

function App() {
  const [urlState, setUrlState] = useState(initialUrlState);
  const [urlError, setUrlError] = useState('');

  // effect to support bidirectional URL editing
  useEffect(() => {
    setUrlError('');

    let shouldUpdate = false;
    const nextState = {
      ...urlState,
      lastEngage: '',
    };

    if (urlState.lastEngage === 'string') {
      try {
        const nextUrl = new URL(urlState.string);
        nextState.url = nextUrl;
        shouldUpdate = true;
      } catch (e) {
        setUrlError(e.toString());
      }
    }
    else if (urlState.lastEngage === 'url') {
      // try to turn it from state => string
      try {
        const nextString = nextState.url.toString();
        nextState.string = nextString;
        shouldUpdate = true;
      } catch (e) {
        setUrlError(e.toString());
      }
    }

    if (shouldUpdate) {
      setUrlState(nextState);
    }
  }, [urlState.string, urlState.url]);

  // effect to update the URL as it changes
  useEffect(() => {
    const {string} = urlState;
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('url', string);
    window.history.pushState(
      {
        url: urlState.string,
      },
      null,
      currentUrl.toString(),
    );
  }, [urlState.string]);

  // effect to read the "url" query param at page load
  // useEffect(() => {
  //   const thisUrl = new URL(window.location.href);
  //   const urlParam = thisUrl.searchParams.get('url');
  //   if (urlParam) {
  //     // update the state to that
  //     const url = new URL(urlParam);
  //     setUrlState({
  //       url,
  //       string: urlParam,
  //       lastEngage: '',
  //     });
  //   }
  //   else {
  //     setUrlState(initialString);
  //   }
  // }, []);

  const setUrlField = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    const nextUrl = new URL(urlState.url);
    nextUrl[name] = value;
    setUrlState(state => ({
      ...state,
      url: nextUrl,
      lastEngage: 'url',
    }));
  };

  const setSearchParams = (searchParams) => {
    const nextUrl = new URL(urlState.url);
    nextUrl.search = searchParams.toString();
    setUrlState(state => ({
      ...state,
      url: nextUrl,
      lastEngage: 'url',
    }));
  };

  const setUrlString = (event) => {
    const str = event.target.value;
    setUrlState(state => ({
      ...state,
      string: str,
      lastEngage: 'string',
    }));
  };

  return (
    <main>
      <h1>Live URL Editor</h1>
      <div id="url">
        <input type="text" value={urlState.string} onChange={setUrlString} />
      </div>
      <hr />
      {
        urlError.length > 0 ? (
          <div className="error">Error: {urlError}</div>
        ) : null
      }
      <div id="fields">
        <div className="field">
          <div className="field-name">Protocol</div>
          <input type="text" name="protocol" value={urlState.url.protocol} onChange={setUrlField} />
        </div>
        <div className="field">
          <div className="field-name">Host</div>
          <input type="text" name="hostname" value={urlState.url.hostname} onChange={setUrlField} />
        </div>
        <div className="field">
          <div className="field-name">Port</div>
          <input type="text" name="port" value={urlState.url.port} onChange={setUrlField} />
        </div>
        <div className="field">
          <div className="field-name">Search</div>
          <input type="text" name="search" value={urlState.url.search} onChange={setUrlField} />
        </div>
        <div className="field">
          <div className="field-name">Anchor</div>
          <input type="text" name="hash" value={urlState.url.hash} onChange={setUrlField} />
        </div>
        <hr />
        <SearchParamDisplay
          searchParams={urlState.url.searchParams}
          setSearchParams={setSearchParams}
        />
      </div>
    </main>
  );
}

export default App;
