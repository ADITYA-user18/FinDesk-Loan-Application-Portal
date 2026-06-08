import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// ── Initial State ────────────────────────────────────────────
const initialState = {
  applications: [],
  summary: null,
  loading: false,
  summaryLoading: false,
  error: null,
  filter: 'all',
  search: '',
  pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
};

// ── Action Types ─────────────────────────────────────────────
export const ACTIONS = {
  SET_LOADING:       'SET_LOADING',
  SET_SUMMARY_LOADING: 'SET_SUMMARY_LOADING',
  SET_APPLICATIONS:  'SET_APPLICATIONS',
  SET_SUMMARY:       'SET_SUMMARY',
  ADD_APPLICATION:   'ADD_APPLICATION',
  UPDATE_STATUS:     'UPDATE_STATUS',
  SET_ERROR:         'SET_ERROR',
  SET_FILTER:        'SET_FILTER',
  SET_SEARCH:        'SET_SEARCH',
};

// ── Reducer ──────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_SUMMARY_LOADING:
      return { ...state, summaryLoading: action.payload };
    case ACTIONS.SET_APPLICATIONS:
      return { ...state, applications: action.payload.data, pagination: action.payload.pagination, loading: false, error: null };
    case ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload, summaryLoading: false };
    case ACTIONS.ADD_APPLICATION:
      return { ...state, applications: [action.payload, ...state.applications] };
    case ACTIONS.UPDATE_STATUS:
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id ? { ...app, status: action.payload.status } : app
        ),
      };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_FILTER:
      return { ...state, filter: action.payload };
    case ACTIONS.SET_SEARCH:
      return { ...state, search: action.payload };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setFilter = useCallback((f) => dispatch({ type: ACTIONS.SET_FILTER, payload: f }), []);
  const setSearch = useCallback((s) => dispatch({ type: ACTIONS.SET_SEARCH, payload: s }), []);

  // Memoised derived values
  const filteredApps = useMemo(() => {
    let apps = state.applications;
    if (state.filter !== 'all') apps = apps.filter((a) => a.status === state.filter);
    if (state.search.trim()) {
      const term = state.search.toLowerCase();
      apps = apps.filter((a) =>
        a.name.toLowerCase().includes(term) || a.mobile.includes(term)
      );
    }
    return apps;
  }, [state.applications, state.filter, state.search]);

  const value = useMemo(() => ({
    ...state,
    filteredApps,
    dispatch,
    setFilter,
    setSearch,
  }), [state, filteredApps, setFilter, setSearch]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};
