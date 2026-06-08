import { useCallback } from 'react';
import { useAppContext, ACTIONS } from '../context/AppContext';
import { applicationsAPI, summaryAPI } from '../api/client';

/**
 * Custom hook — centralises all data-fetching logic.
 * Components stay clean; all API calls live here.
 */
export function useApplications() {
  const { dispatch, filter, search } = useAppContext();

  const fetchApplications = useCallback(async (params = {}) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const queryParams = {};
      if (params.status && params.status !== 'all') queryParams.status = params.status;
      if (params.search?.trim()) queryParams.search = params.search.trim();
      const res = await applicationsAPI.getAll(queryParams);
      dispatch({
        type: ACTIONS.SET_APPLICATIONS,
        payload: { data: res.data.data, pagination: res.data.pagination },
      });
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.userMessage || 'Failed to fetch applications.' });
    }
  }, [dispatch]);

  const fetchSummary = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_SUMMARY_LOADING, payload: true });
    try {
      const res = await summaryAPI.get();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: res.data.data });
    } catch (err) {
      dispatch({ type: ACTIONS.SET_SUMMARY_LOADING, payload: false });
    }
  }, [dispatch]);

  const submitApplication = useCallback(async (formData) => {
    const res = await applicationsAPI.submit(formData);
    dispatch({ type: ACTIONS.ADD_APPLICATION, payload: res.data.data });
    return res.data;
  }, [dispatch]);

  const updateStatus = useCallback(async (id, status) => {
    const res = await applicationsAPI.updateStatus(id, status);
    dispatch({ type: ACTIONS.UPDATE_STATUS, payload: { id, status } });
    // Refresh summary stats without full reload
    fetchSummary();
    return res.data;
  }, [dispatch, fetchSummary]);

  return { fetchApplications, fetchSummary, submitApplication, updateStatus };
}
