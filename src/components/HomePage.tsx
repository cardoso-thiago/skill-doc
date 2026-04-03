import React, { useState, useCallback, useMemo } from 'react';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Skill {
  id: string;
  name: string;
  description: string;
  license: string | null;
  githubUrl: string;
  categories: string[];
}

interface HomeProps {
  skillsData: Skill[];
  infoData: {
    content: string;
  };
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

function SkillCard({
  skill,
  query,
  onCategoryClick
}: {
  skill: Skill;
  query: string;
  onCategoryClick: (category: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  const handleCatClick = (e: React.MouseEvent, cat: string) => {
    e.preventDefault();
    e.stopPropagation();
    onCategoryClick(cat);
  };

  const toggleShowAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAll(!showAll);
  };

  const displayedCategories = showAll ? skill.categories : skill.categories.slice(0, 3);
  const hasMore = skill.categories.length > 3;

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
            {hasMore && (
              <button
                className={`skill-card__category-toggle ${showAll ? 'is-expanded' : ''}`}
                onClick={toggleShowAll}
                title={showAll ? 'Show less' : `Show ${skill.categories.length - 3} more`}
              >
                {showAll ? '−' : `+${skill.categories.length - 3}`}
              </button>
            )}
          </div>
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

        <div className="skill-card__footer">
          <span className="skill-card__id">{skill.id}</span>
        </div>
      </Link>
    </div>
  );
}

export default function Home({ skillsData = [], infoData }: HomeProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'categories' | 'info'>('skills');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [catSortBy, setCatSortBy] = useState<'name' | 'count'>('name');
  
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

  const filteredSkills = useMemo(() => {
    let result = skillsData;

    // Filter by selected category first
    if (selectedCategory) {
      result = result.filter(s => s.categories.includes(selectedCategory));
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.categories.some(c => c.toLowerCase().includes(q))
      );
    }

    return result;
  }, [skillsData, query, selectedCategory]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const clearCategory = () => setSelectedCategory(null);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('skills');
  };

  return (
    <div className="skills-layout">
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
              {query.trim() && ` matching "${query}"`}
            </p>
            {selectedCategory && (
              <button className="clear-filter" onClick={clearCategory}>
                ✕ Clear category filter
              </button>
            )}
          </div>

          <main>
            <div className="skills-grid" role="list">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <div key={skill.id} role="listitem">
                    <SkillCard
                      skill={skill}
                      query={query}
                      onCategoryClick={handleCategorySelect}
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
