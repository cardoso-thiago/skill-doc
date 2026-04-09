import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Skill {
  id: string;
  name: string;
  description: string;
  license: string | null;
  githubUrl: string;
  downloadUrl: string;
  categories: string[];
  authors: string[];
}

interface HomeProps {
  skillsData: Skill[];
  infoData: {
    content: string;
  };
}

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
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

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SkillCard({
  skill,
  query,
  onCategoryClick,
  onAuthorClick
}: {
  skill: Skill;
  query: string;
  onCategoryClick: (category: string) => void;
  onAuthorClick: (author: string) => void;
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  const handleCatClick = (e: React.MouseEvent, cat: string) => {
    e.preventDefault();
    e.stopPropagation();
    onCategoryClick(cat);
  };

  const handleAuthorClick = (e: React.MouseEvent, author: string) => {
    e.preventDefault();
    e.stopPropagation();
    onAuthorClick(author);
  };

  const toggleShowAllCategories = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllCategories(!showAllCategories);
  };

  const toggleShowAllAuthors = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllAuthors(!showAllAuthors);
  };

  const displayedCategories = showAllCategories ? skill.categories : skill.categories.slice(0, 3);
  const hasMoreCategories = skill.categories.length > 3;

  const displayedAuthors = showAllAuthors ? skill.authors : skill.authors.slice(0, 3);
  const hasMoreAuthors = skill.authors.length > 3;

  return (
    <div className="skill-card-wrapper">
      <Link to={`/skill/${skill.id}`} className="skill-card">
        <div className="skill-card__header">
          <div className="skill-card__categories">
            {displayedCategories.map((cat) => (
              <span
                key={cat}
                className="skill-card__category-label"
                onClick={(e) => handleCatClick(e, cat)}
              >
                {cat}
              </span>
            ))}
            {hasMoreCategories && (
              <button
                className={`skill-card__category-toggle ${showAllCategories ? 'is-expanded' : ''}`}
                onClick={toggleShowAllCategories}
                title={showAllCategories ? 'Show less' : `Show ${skill.categories.length - 3} more`}
              >
                {showAllCategories ? '−' : `+${skill.categories.length - 3}`}
              </button>
            )}
          </div>
          <div className="skill-card__actions">
            <a
              href={skill.downloadUrl}
              download={`${skill.id}.zip`}
              className="skill-card__download-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = skill.downloadUrl;
              }}
              title="Download skill (.zip)"
            >
              <DownloadIcon />
            </a>
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
        </div>

        <h2 className="skill-card__name">
          <HighlightedText text={skill.name} query={query} />
        </h2>

        <p className="skill-card__description">
          <HighlightedText text={skill.description} query={query} />
        </p>

        <div className="skill-card__footer">
          {skill.authors && skill.authors.length > 0 ? (
            <div className="skill-card__authors">
              {displayedAuthors.map((author, idx) => (
                <button
                  key={idx}
                  className="skill-card__author-btn"
                  onClick={(e) => handleAuthorClick(e, author)}
                >
                  {author}
                </button>
              ))}
              {hasMoreAuthors && (
                <button
                  className={`skill-card__category-toggle ${showAllAuthors ? 'is-expanded' : ''}`}
                  onClick={toggleShowAllAuthors}
                  title={showAllAuthors ? 'Show less' : `Show ${skill.authors.length - 3} more`}
                >
                  {showAllAuthors ? '−' : `+${skill.authors.length - 3}`}
                </button>
              )}
            </div>
          ) : (
            <span className="skill-card__id">{skill.id}</span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function Home({ skillsData = [], infoData }: HomeProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'categories' | 'authors' | 'info'>('skills');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  const [catSortBy, setCatSortBy] = useState<'name' | 'count'>('name');
  const [authorSortBy, setAuthorSortBy] = useState<'name' | 'count'>('count');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorParam = params.get('author');
    if (authorParam) {
      setSelectedAuthor(decodeURIComponent(authorParam));
      setActiveTab('skills');
    }
  }, []);

  const categoriesWithCounts = useMemo(() => {
    const list = Array.from(new Set(skillsData.flatMap(s => s.categories)));
    return list.map(name => ({
      name,
      count: skillsData.filter(s => s.categories.includes(name)).length
    }));
  }, [skillsData]);

  const sortedCategories = useMemo(() => {
    const sorted = [...categoriesWithCounts].sort((a, b) => {
      if (catSortBy === 'count') {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return sorted;
  }, [categoriesWithCounts, catSortBy]);

  const authorsWithCounts = useMemo(() => {
    const list = Array.from(new Set(skillsData.flatMap(s => s.authors || [])));
    return list.map(name => ({
      name,
      count: skillsData.filter(s => (s.authors || []).includes(name)).length
    }));
  }, [skillsData]);

  const sortedAuthors = useMemo(() => {
    const sorted = [...authorsWithCounts].sort((a, b) => {
      if (authorSortBy === 'count') {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return sorted;
  }, [authorsWithCounts, authorSortBy]);

  const filteredSkills = useMemo(() => {
    let result = skillsData;

    // Filter by selected category first
    if (selectedCategory) {
      result = result.filter(s => s.categories.includes(selectedCategory));
    }

    // Filter by selected author
    if (selectedAuthor) {
      result = result.filter(s => (s.authors || []).includes(selectedAuthor));
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.categories.some(c => c.toLowerCase().includes(q)) ||
          (s.authors || []).some(a => a.toLowerCase().includes(q))
      );
    }

    return result;
  }, [skillsData, query, selectedCategory, selectedAuthor]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const clearCategory = () => setSelectedCategory(null);
  const clearAuthor = () => setSelectedAuthor(null);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('skills');
  };

  const handleAuthorSelect = (author: string) => {
    setSelectedAuthor(author);
    setActiveTab('skills');
  };

  return (
    <div className="skills-layout">
      <SkipLink />
      <header className="site-header">
        <p className="site-header__eyebrow">Agent Skills Registry</p>
        <h1 className="site-header__title">
          Skills <em>Showcase</em>
        </h1>
        {activeTab === 'skills' && (
          <p className="site-header__meta">
            // {skillsData.length} skills available — browse or search below
          </p>
        )}

        <nav className="site-navigation" aria-label="Main Navigation">
          <button
            className={`nav-tab ${activeTab === 'skills' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`nav-tab ${activeTab === 'categories' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`nav-tab ${activeTab === 'authors' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('authors')}
          >
            Authors
          </button>
          <button
            className={`nav-tab ${activeTab === 'info' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
        </nav>
      </header>

      {activeTab === 'skills' && (
        <div className="search-bar" role="search">
          <input
            id="skills-search"
            type="text"
            className="search-bar__input"
            placeholder="Search by name, description or category..."
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
      )}

      {activeTab === 'skills' && (
        <>
          <div className="results-meta-wrapper">
            <p className="results-meta" aria-live="polite">
              <span className="results-meta__count">{filteredSkills.length}</span>
              {filteredSkills.length === 1 ? ' skill' : ' skills'}
              {selectedCategory && (
                <> in <strong>{selectedCategory}</strong></>
              )}
              {selectedAuthor && (
                <> by <strong>{selectedAuthor}</strong></>
              )}
              {query.trim() && ` matching "${query}"`}
            </p>
            {(selectedCategory || selectedAuthor) && (
              <button className="clear-filter" onClick={() => {
                clearCategory();
                clearAuthor();
              }}>
                ✕ Clear filters
              </button>
            )}
          </div>

          <main id="main-content" tabIndex={-1}>
            <div className="skills-grid" role="list">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <div key={skill.id} role="listitem">
                    <SkillCard
                      skill={skill}
                      query={query}
                      onCategoryClick={handleCategorySelect}
                      onAuthorClick={handleAuthorSelect}
                    />
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">⌀</div>
                  <p className="empty-state__title">No skills found</p>
                  <p className="empty-state__subtitle">
                    Try a different search term or category
                  </p>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {activeTab === 'categories' && (
        <main className="categories-view">
          <div className="category-header">
            <button
              className={`category-header__label ${catSortBy === 'name' ? 'is-active' : ''}`}
              onClick={() => setCatSortBy('name')}
            >
              CATEGORY
            </button>
            <button
              className={`category-header__label ${catSortBy === 'count' ? 'is-active' : ''}`}
              onClick={() => setCatSortBy('count')}
            >
              #
            </button>
          </div>
          <div className="categories-list">
            {sortedCategories.map(cat => (
              <button
                key={cat.name}
                className="category-item"
                onClick={() => handleCategorySelect(cat.name)}
              >
                <span className="category-item__name">{cat.name}</span>
                <span className="category-item__line"></span>
                <span className="category-item__count">
                  {cat.count} {cat.count === 1 ? 'skill' : 'skills'}
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'authors' && (
        <main className="categories-view">
          <div className="category-header">
            <button
              className={`category-header__label ${authorSortBy === 'name' ? 'is-active' : ''}`}
              onClick={() => setAuthorSortBy('name')}
            >
              AUTHOR
            </button>
            <button
              className={`category-header__label ${authorSortBy === 'count' ? 'is-active' : ''}`}
              onClick={() => setAuthorSortBy('count')}
            >
              #
            </button>
          </div>
          <div className="categories-list">
            {sortedAuthors.map(author => (
              <button
                key={author.name}
                className="category-item"
                onClick={() => handleAuthorSelect(author.name)}
              >
                <span className="category-item__name">{author.name}</span>
                <span className="category-item__line"></span>
                <span className="category-item__count">
                  {author.count} {author.count === 1 ? 'skill' : 'skills'}
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'info' && (
        <main className="info-view">
          <article className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {infoData.content}
            </ReactMarkdown>
          </article>
        </main>
      )}
    </div>
  );
}
