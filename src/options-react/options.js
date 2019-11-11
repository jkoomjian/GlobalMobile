let shouldLoadInitialState = true;

/** App */
const App = props => {
  const initialState = {
    showAddNew: false,
    autoRun: false,
    whitelist: {},
    blacklist: {},
  };

  const [state, setState] = React.useState(initialState);
  const { showAddNew, autoRun, whitelist, blacklist } = state;

  // set initial state with values from Chrome
  if (window.cExt && shouldLoadInitialState) {
    shouldLoadInitialState = false;
    cExt.getInitialState().then(is => {
      setState(is);
    });
  }

  const updateShowAddNew = val => {
    setState({ ...state, showAddNew: val });
  };

  const toggleAutoRun = () => {
    // update chrome
    if (window.cExt) cExt.saveAutoRun(!state.autoRun);
    // update state
    setState({ ...state, autoRun: !state.autoRun });
  };

  // You can only call setState once per invocation / event
  // Otherwise the state will not be updated by useState and the 
  // second invocation of setState will overwrite the first
  // Alternatively use different states for different parts of the data
  const addSite = async (url, shouldSkipHome) => {
    const listName = state.autoRun ? 'blacklist' : 'whitelist';
    if (window.cExt) await cExt.addSite(url, shouldSkipHome, listName);
    setState({
      ...state,
      [listName]: { ...state[listName], [url]: shouldSkipHome },
      showAddNew: false
    });
  };

  const deleteSite = async urlToDelete => {
    const listName = state.autoRun ? 'blacklist' : 'whitelist';
    if (window.cExt) await cExt.deleteSite(urlToDelete, listName);
    const listClone = {...state[listName]};
    delete listClone[urlToDelete];
    setState({
      ...state,
      [listName]: listClone
    });
  };

  return (
    <React.Fragment>
      <RunByDefault {...{ autoRun, toggleAutoRun }} />
      <SiteList {...{ showAddNew, updateShowAddNew, autoRun, whitelist, blacklist, deleteSite }} />
      <AddSitePanel {...{ showAddNew, updateShowAddNew, autoRun, addSite }} />
    </React.Fragment>
  );
};

/** RunByDefault */
const RunByDefault = ({ autoRun, toggleAutoRun }) => {
  return (
    <div className='always-on subsetting'>
      <h3>Run By Default</h3>
      <div className='always-on-options'>
        <div className='form'>
          <input type='checkbox' id='autoRunCheckbox' checked={!!autoRun} onChange={toggleAutoRun} />
        </div>
        <label for='autoRunCheckbox' className='label'>
          GlobalMobile runs automatically on pages which have been added to the whitelist.
          <br />
          Checking this box reverses this behavior -
          <br />
          GlobalMobile will run on every page, except the pages added to the list.
        </label>
      </div>
    </div>
  );
}

/** SiteList */
const SiteList = ({ updateShowAddNew, autoRun, whitelist, blacklist, deleteSite }) => {
  return (
    <div className='whitelist subsetting'>


      <div>
        <h3>{!autoRun ? 'Whitelist' : 'Blacklist'}</h3>
        <div className='subtext'>
          {!autoRun ? 'GlobalMobile will run on the sites below:' : 'GlobalMobile will run on evey site EXCEPT those below:'}
        </div>
      </div>

      <div className='wl-list'>
        <div className='wl-sites'>

          <div>
            {
              Object.keys(!autoRun ? whitelist : blacklist).map(url => <Site {...{url, deleteSite}} />)
            }
          </div>

        </div>
        <button id='add-new' className='wl-add' onClick={() => updateShowAddNew(true)}>Add New</button>
      </div>
    </div>
  );
};

/** Site */
const Site = ({url, deleteSite}) => (
  <div className='wl-site'>
    <div className='wls-host'>{url}</div>
    <div className='wls-delete' onClick={() => deleteSite(url)}>X</div>
  </div>
);

/** CloseButton */
// const CloseButton = props => {
//   const closeOptions = async () => {
//     const tab = await browser.tabs.getCurrent();
//     browser.tabs.remove(tab.id);
//   };
//   return (
//     <div className='finished-row'>
//       <button id='finished' onClick={closeOptions}>Close</button>
//     </div>
//   );
// };

/** AddSitePanel */
const AddSitePanel = ({ showAddNew, updateShowAddNew, autoRun, addSite }) => {
  const [state, setState] = React.useState({ url: undefined, shouldSkipHome: false });

  const closeAddNew = event => {
    if (!event || event.target.classList.contains('lightbox') || event.target.classList.contains('close')) {
      updateShowAddNew(false);
    }
  };

  const handleFormChange = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (value === 'on') value = e.target.checked;
    setState({ ...state, [name]: value });
  };

  const getUrlValidationClass = () => {
    const urlRe = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;
    if (!state.url) return null;
    return urlRe.test(state.url) ? 'valid' : 'invalid';
  };

  if (!showAddNew) return null;

  const isDisabled = getUrlValidationClass() === 'valid' ? {} : { disabled: true };

  let runOnHomepage = null;
  if (!autoRun) {
    runOnHomepage = (
      <div className='options'>
        <input type='checkbox' id='skipHomeCheckbox' name='shouldSkipHome' checked={state.shouldSkipHome} onChange={event => handleFormChange(event)} />
        <label for='skipHomeCheckbox'>
          Don't run on homepage
          <div className='subtext'>(Ex. will run on nytimes.com/article but not nytimes.com/)</div>
        </label>
      </div>
    );
  }

  return (
    <div className='lightbox' onClick={closeAddNew}>
      <div className='add-panel'>
        <div className='close'>X</div>
        <h4>Add Site</h4>
        <div className='subtext'>
          Add a new site to the {!autoRun ? 'whitelist' : 'blacklist'}
        </div>
        <div className='form-fields'>
          <input
            type='text'
            id='new-site'
            name='url'
            value={state.url}
            placeholder='http://www.google.com'
            tabindex='1'
            onChange={event => handleFormChange(event)}
            className={getUrlValidationClass()}
          />
          <input {...{
            ...isDisabled,
            type: 'submit',
            id: 'new-site-submit',
            value: 'Add',
            tabindex: '2',
            onClick: (() => {
              addSite(state.url, state.shouldSkipHome);
            })
          }} />
        </div>
        {runOnHomepage}
      </div>
    </div>
  );
};

/** Run!! */
ReactDOM.render(<App />, document.getElementById('root'));
