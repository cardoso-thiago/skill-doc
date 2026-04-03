import React, { useState, useCallback, useMemo } from 'react';
import Link from '@docusaurus/Link';

interface Skill {
  id: string;
  name: string;
  description: string;
  license: string | null;
  githubUrl: string;
}

interface HomeProps {
  skillsData: Skill[];
}

/**
 * Highlights matched portion of text with a <mark> element.
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="highlight-match">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function SkillCard({ skill, query }: { skill: Skill; query: string }) {
  return (
    <Link to={`/skill/${skill.id}`} className="skill-card">
      <div className="skill-card__header">
        <span className="skill-card__id">{skill.id}</span>
        <svg
          className="skill-card__arrow"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 13L13 3M13 3H6M13 3V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="skill-card__name">
        <HighlightedText text={skill.name} query={query} />
      </h2>

      <p className="skill-card__description">
        <HighlightedText text={skill.description} query={query} />
      </p>
    </Link>
  );
}

export default function Home({ skillsData = [] }: HomeProps) {
  const [query, setQuery] = useState('');

  const filteredSkills = useMemo(() => {
    if (!query.trim()) return skillsData;
    const q = query.toLowerCase();
    return skillsData.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [skillsData, query]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  if (!skillsData) {
    return null;
  }

  return (
    <div className="skills-layout">
      <header className="site-header">
        <p className="site-header__eyebrow">Agent Skills Registry</p>
        <h1 className="site-header__title">
          Skills <em>Showcase</em>
        </h1>
        <p className="site-header__meta">
          // {skillsData.length} skills available — browse or search below
        </p>
      </header>

      <div className="search-bar" role="search">
        <input
          id="skills-search"
          type="text"
          className="search-bar__input"
          placeholder="Search by name or description..."
          value={query}
          onChange={handleSearch}
          autoComplete="off"
          aria-label="Search skills"
        />
        <svg
          className="search-bar__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <p className="results-meta" aria-live="polite">
        <span className="results-meta__count">{filteredSkills.length}</span>
        {filteredSkills.length === 1 ? ' skill' : ' skills'}
        {query.trim() && ` matching "${query}"`}
      </p>

      <main>
        <div className="skills-grid" role="list">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div key={skill.id} role="listitem">
                <SkillCard skill={skill} query={query} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">⌀</div>
              <p className="empty-state__title">No skills found</p>
              <p className="empty-state__subtitle">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
