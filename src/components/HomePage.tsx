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

interface Bundle {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  downloadUrl: string;
}

interface HomeProps {
  skillsData: Skill[];
  bundlesData: Bundle[];
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

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
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
  currentSearch,
  onCategoryClick,
  onAuthorClick
}: {
  skill: Skill;
  query: string;
  currentSearch: string;
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
      <Link to={`/skill/${skill.id}${currentSearch}`} className="skill-card">
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


function BundleCard({
  bundle,
  onSelect
}: {
  bundle: Bundle;
  onSelect: (bundle: Bundle) => void;
}) {
  return (
    <div className="bundle-card" onClick={() => onSelect(bundle)}>
      <div className="bundle-card__content">
        <div className="bundle-card__header">
          <div className="module__led"></div>
        </div>
        <h2 className="bundle-card__name">{bundle.name}</h2>
        <p className="bundle-card__description">{bundle.description}</p>
        <div className="bundle-card__manifest">
          <span className="manifest__label">CONTAINS {bundle.skillIds.length} SKILLS:</span>
          <div className="manifest__list">
            {bundle.skillIds.slice(0, 5).map(id => (
              <span key={id} className="manifest__item">{id}</span>
            ))}
            {bundle.skillIds.length > 5 && (
              <span className="manifest__item">+{bundle.skillIds.length - 5} MORE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({ skillsData = [], bundlesData = [], infoData }: HomeProps) {
  // Helper to read from URL
  const getParam = (key: string) => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get(key);
  };

  const [query, setQuery] = useState(() => {
    const q = getParam('q');
    return q ? decodeURIComponent(q) : '';
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const cat = getParam('cat');
    return cat ? decodeURIComponent(cat) : null;
  });

  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(() => {
    const author = getParam('author');
    return author ? decodeURIComponent(author) : null;
  });

  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(() => {
    const bundle = getParam('bundle');
    return bundle ? decodeURIComponent(bundle) : null;
  });

  const [activeTab, setActiveTab] = useState<'skills' | 'bundles' | 'categories' | 'authors' | 'info'>(() => {
    // Priority: If any filter is active, force 'skills' tab
    const cat = getParam('cat');
    const author = getParam('author');
    const bundle = getParam('bundle');
    const q = getParam('q');
    if (cat || author || bundle || q) return 'skills';

    const tab = getParam('tab');
    if (tab && ['skills', 'bundles', 'categories', 'authors', 'info'].includes(tab)) return tab as any;
    return 'skills';
  });

  // Reative Query String Generator
  const currentSearch = useMemo(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'skills') params.set('tab', activeTab);
    if (query) params.set('q', query);
    if (selectedCategory) params.set('cat', selectedCategory);
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (selectedBundleId) params.set('bundle', selectedBundleId);
    const str = params.toString();
    return str ? '?' + str : '';
  }, [activeTab, query, selectedCategory, selectedAuthor, selectedBundleId]);

  const selectedBundle = useMemo(() => 
    bundlesData.find(b => b.id === selectedBundleId) || null
  , [bundlesData, selectedBundleId]);

  const [catSortBy, setCatSortBy] = useState<'name' | 'count'>('name');
  const [authorSortBy, setAuthorSortBy] = useState<'name' | 'count'>('count');

  // Sync state with URL - using the reactive currentSearch
  const updateUrl = useCallback((searchStr: string) => {
    if (typeof window === 'undefined') return;
    const newUrl = `${window.location.pathname}${searchStr}`;
    window.history.replaceState(null, '', newUrl);
  }, []);

  // Sync state FROM url on popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      
      const qVal = params.get('q') ? decodeURIComponent(params.get('q')!) : '';
      const catVal = params.get('cat') ? decodeURIComponent(params.get('cat')!) : null;
      const authorVal = params.get('author') ? decodeURIComponent(params.get('author')!) : null;
      const bundleVal = params.get('bundle') ? decodeURIComponent(params.get('bundle')!) : null;

      setQuery(qVal);
      setSelectedCategory(catVal);
      setSelectedAuthor(authorVal);
      setSelectedBundleId(bundleVal);

      const tabParam = params.get('tab') as any;
      if (qVal || catVal || authorVal || bundleVal) {
        setActiveTab('skills');
      } else if (tabParam && ['skills', 'bundles', 'categories', 'authors', 'info'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('skills');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL whenever significant state changes
  useEffect(() => {
    updateUrl(currentSearch);
  }, [currentSearch, updateUrl]);

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

    // Filter by bundle membership
    if (selectedBundle) {
      result = result.filter(s => selectedBundle.skillIds.includes(s.id));
    }

    // Filter by selected category
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
  }, [skillsData, query, selectedCategory, selectedAuthor, selectedBundle]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const clearCategory = () => setSelectedCategory(null);
  const clearAuthor = () => setSelectedAuthor(null);
  const clearBundle = () => setSelectedBundleId(null);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedAuthor(null);
    setSelectedBundleId(null);
    setActiveTab('skills');
  };

  const handleAuthorSelect = (author: string) => {
    setSelectedAuthor(author);
    setSelectedCategory(null);
    setSelectedBundleId(null);
    setActiveTab('skills');
  };

  const handleBundleSelect = (bundle: Bundle) => {
    setSelectedBundleId(bundle.id);
    setSelectedCategory(null);
    setSelectedAuthor(null);
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
          {bundlesData.length > 0 && (
            <button
              className={`nav-tab ${activeTab === 'bundles' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('bundles')}
            >
              Bundles
            </button>
          )}
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
              {selectedBundle && (
                <> in bundle <strong>{selectedBundle.name}</strong></>
              )}
              {selectedCategory && (
                <> in <strong>{selectedCategory}</strong></>
              )}
              {selectedAuthor && (
                <> by <strong>{selectedAuthor}</strong></>
              )}
              {query.trim() && ` matching "${query}"`}
            </p>
            <div className="results-actions">
              {selectedBundle && (
               <a 
                 href={selectedBundle.downloadUrl}
                 className="bundle-download-action"
                 title={`Download ${selectedBundle.name} (.zip)`}
               >
                 <DownloadIcon />
                 <span>Download Bundle</span>
               </a>
              )}
              {(selectedCategory || selectedAuthor || selectedBundleId) && (
                <button className="clear-filter" onClick={() => {
                  clearCategory();
                  clearAuthor();
                  clearBundle();
                }}>
                  ✕ Clear filters
                </button>
              )}
            </div>
          </div>

          <main id="main-content" tabIndex={-1}>
            <div className="skills-grid" role="list">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <div key={skill.id} role="listitem">
                    <SkillCard
                      skill={skill}
                      query={query}
                      currentSearch={currentSearch}
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

      {activeTab === 'bundles' && (
        <main className="bundles-view">
          <div className="bundles-grid">
            {bundlesData.map(bundle => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onSelect={handleBundleSelect}
              />
            ))}
          </div>
        </main>
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
