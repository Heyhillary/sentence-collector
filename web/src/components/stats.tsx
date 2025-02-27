import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getStats } from '../actions/languages';
import truthyFilter from '../truthyFilter';
import type { RootState } from '../types';
import LanguageInfo from './language-info';

export default function Stats() {
  const dispatch = useDispatch();
  const {
    all: languageStats,
    userUnreviewed,
    totals,
  } = useSelector((state: RootState) => state.languages.stats);
  const { allLanguages, languages, lastStatsUpdate, statsUpdating } = useSelector(
    (state: RootState) => state.languages
  );

  useEffect(() => {
    dispatch(getStats(languages, lastStatsUpdate));
  }, []);

  const extendedLanguages = languages
    .map((lang) => allLanguages.find((extendedLanguage) => extendedLanguage.id === lang))
    .filter(truthyFilter);

  return (
    <div>
      <h1>Statistics</h1>
      <p>Last Update: {lastStatsUpdate ? new Date(lastStatsUpdate).toLocaleString() : 'never'}</p>
      {statsUpdating && <p>Updating...</p>}

      {lastStatsUpdate && (
        <React.Fragment>
          {totals && (
            <p>
              The Common Voice Sentence Collector has collected {totals.total} sentences in{' '}
              {totals.languages} languages!
            </p>
          )}

          {extendedLanguages
            .map(
              (lang) =>
                languageStats &&
                languageStats[lang.id] && (
                  <LanguageInfo
                    key={lang.id}
                    language={lang.id}
                    languageName={lang.name}
                    nativeLanguageName={lang.nativeName}
                    total={languageStats[lang.id].added}
                    validated={languageStats[lang.id].validated}
                    rejected={languageStats[lang.id].rejected}
                    unreviewedByYou={userUnreviewed[lang.id]}
                  />
                )
            )
            .filter(Boolean)}
        </React.Fragment>
      )}
    </div>
  );
}
