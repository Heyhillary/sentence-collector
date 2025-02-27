import React, { useEffect, useState } from 'react';

import '../../css/sentences-list.css';

import { sendRequest } from '../backend';
import truthyFilter from '../truthyFilter';
import type { SentenceRecord } from '../types';
import Sentence from './sentence';
import SpinnerButton from './spinner-button';

type MySentenceBatch = {
  source: string;
  sentences: SentenceRecord[];
};

export type MySentences = Record<string, Record<string, MySentenceBatch>>;

export default function MySentencesList() {
  const [sentencesToDelete, setSentencesToDelete] = useState<Record<number, boolean>>({});
  const [sentencesLoading, setSentencesLoading] = useState<boolean>(false);
  const [sentences, setSentences] = useState<MySentences>({});
  const [error, setError] = useState<Error>();
  const [sentencesDeleting, setSentencesDeleting] = useState<boolean>(false);
  const [deletionError, setDeletionError] = useState<Error>();
  const hasNoSentences = Object.keys(sentences).length === 0;

  const fetchSentences = async () => {
    try {
      setError(undefined);
      setSentencesLoading(true);
      const results = await sendRequest<MySentences>('sentences/my');
      setSentencesLoading(false);
      setSentences(results);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    fetchSentences();
  }, []);

  const onSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSentencesToDelete((previousValue) => {
      return Object.assign({}, previousValue, {
        [event.target.name]: event.target.checked,
      });
    });
  };

  const deleteSelected = async (event: React.MouseEvent) => {
    event.preventDefault();

    const sentences = Object.entries(sentencesToDelete)
      .map(([sentenceId, toDelete]) => {
        if (!toDelete) {
          return;
        }

        return parseInt(sentenceId, 10);
      })
      .filter(truthyFilter);

    try {
      setDeletionError(undefined);
      setSentencesDeleting(true);
      await sendRequest<Record<string, never>>('sentences/delete', 'POST', { sentences });
      setSentencesDeleting(false);
      await fetchSentences();
    } catch (error) {
      setDeletionError(error);
    } finally {
      setSentencesToDelete({});
    }
  };

  return (
    <React.Fragment>
      <h1>My Sentences</h1>
      <p>
        This page gives you an overview of all your submitted sentencens. You may also delete
        already submitted sentences if needed by marking the checkbox next to it and clicking on
        &quot;Remove sentences&quot; at the bottom. Please only remove sentences if absolutely
        necessary, for example if you noticed after the fact that a sentence is copyright protected.
      </p>

      {sentencesLoading && <p>Loading your sentences..</p>}

      {error && <p>Error while fetching your sentences. Please try again.</p>}

      {hasNoSentences && !sentencesLoading && <p>No sentences found!</p>}

      {Object.keys(sentences).map((language) => (
        <section key={'section-' + language} className="language-section">
          <h2 key={language}>{language}</h2>

          {Object.keys(sentences[language]).map((batchId) => (
            <section key={'section-' + language + '-' + batchId} className="submission-section">
              <h3 key={batchId}>Submission: {batchId}</h3>
              <small>Source: {sentences[language][batchId].source}</small>

              <ul key={'list-' + language + '-' + batchId} className="no-bullets">
                {sentences[language][batchId].sentences.map((sentence) => (
                  <li key={sentence.id}>
                    <input
                      type="checkbox"
                      id={'sentence-' + sentence.id}
                      name={sentence.id?.toString()}
                      onChange={onSelect}
                    ></input>
                    <label htmlFor={'sentence-' + sentence.id}>
                      <Sentence language={language}>{sentence.sentence}</Sentence>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      ))}

      {!sentencesDeleting && !hasNoSentences && !error && (
        <button className="standalone" onClick={deleteSelected}>
          Delete selected sentences
        </button>
      )}

      {sentencesDeleting && <SpinnerButton text="Deleting selected sentences..."></SpinnerButton>}

      {deletionError && <p>Failed to delete selected sentences.. Please try again!</p>}
    </React.Fragment>
  );
}
