import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BehaviorSubject, combineLatest } from 'rxjs/index';
import { flatMap, map } from 'rxjs/operators';

import withObservableStream from './components/hocs/withObservableStream';

const SUBJECT = {
    POPULARITY: 'search',
    DATE: 'search_by_date',
};

const App = ({
    query,
    subject,
    stories,
    handleQueryChange,
    handleSelectSubject,
}) => (
    <div>
        <h1>React with RxJS</h1>
        <input 
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
        />

        <div>
            {Object.values(SUBJECT).map(value => (
                <button
                    key={value}
                    onClick={() => handleSelectSubject(value)}
                    type='button'
                >
                    { value }
                </button>
            ))}
        </div>

        <p>
            {`http://hn.algolia.com/api/v1/${subject}?query=${query}`}
        </p>

        <ul>
            {stories.map(story => (
                <li key={story.objectID}>
                    <a href={story.url || story.story_url}>
                        { story.title || story.story_title }
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

App.propTypes = {
    query: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    handleQueryChange: PropTypes.func.isRequired,
    handleSelectSubject: PropTypes.func.isRequired,
};

// Observables
const subject$ = new BehaviorSubject(SUBJECT.POPULARITY);
const query$ = new BehaviorSubject('react');
const fetch$ = combineLatest(subject$, query$).pipe(
    flatMap(([subject, query]) =>
        axios(`http://hn.algolia.com/api/v1/${subject}?query=${query}`),
    ),
    map(result => result.data.hits),      
);

export default withObservableStream(
    // observable
    combineLatest(
        subject$,
        query$,
        fetch$,
        (subject, query, stories) => ({
            subject,
            query,
             stories
        }),
    ),
    // triggers
    {
        handleQueryChange: value => query$.next(value),
        handleSelectSubject: subject => subject$.next(subject),
    },
    // initialState
    {
        query: '',
        subject: SUBJECT.POPULARITY,
        stories: []
    }
)(App);