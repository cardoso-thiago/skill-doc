const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Parses YAML frontmatter from a markdown string.
 * Returns { data, content } where data is the parsed frontmatter object.
 */
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: text };

  const yamlBlock = match[1];
  const content = match[2];
  const data = {};

  yamlBlock.split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = value;
  });

  return { data, content };
}

/**
 * Creates a ZIP file containing multiple directories as subfolders.
 * @param {Array<{name: string, path: string}>} sources 
 * @param {string} outPath 
 */
async function createBundleZip(sources, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    sources.forEach(source => {
      archive.directory(source.path, source.name);
    });
    archive.finalize();
  });
}

// Docusaurus plugin: reads all skills folders, extracts frontmatter,
// and creates routes for the home index and individual skill pages.
module.exports = function skillsPlugin(context, options) {
  const GITHUB_REPO = 'https://github.com/cardoso-thiago/skill-doc';
  const GITHUB_BRANCH = 'main';

  return {
    name: 'skills-plugin',

    async loadContent() {
      const skillsDir = path.join(context.siteDir, 'skills');
      const docPath = path.join(context.siteDir, 'DOC.md');
      const bundlesPath = path.join(context.siteDir, 'bundles.json');
      const staticDir = path.join(context.siteDir, 'static');
      const downloadsDir = path.join(staticDir, 'downloads', 'skills');
      const bundleDownloadsDir = path.join(staticDir, 'downloads', 'bundles');

      // Ensure downloads directories exist
      [downloadsDir, bundleDownloadsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      let infoDoc = '';
      if (fs.existsSync(docPath)) {
        infoDoc = fs.readFileSync(docPath, 'utf-8');
      }

      if (!fs.existsSync(skillsDir)) {
        return { skills: [], bundles: [], infoDoc };
      }

      const skillFolders = fs.readdirSync(skillsDir).filter((name) => {
        const dirPath = path.join(skillsDir, name);
        return fs.statSync(dirPath).isDirectory();
      });

      const skills = await Promise.all(
        skillFolders.map(async (folderName) => {
          const skillMdPath = path.join(skillsDir, folderName, 'SKILL.md');
          const categoryPath = path.join(skillsDir, folderName, 'category.txt');
          const authorPath = path.join(skillsDir, folderName, 'author.txt');
          const currentSkillDir = path.join(skillsDir, folderName);
          
          if (!fs.existsSync(skillMdPath)) return null;

          const raw = fs.readFileSync(skillMdPath, 'utf-8');
          const { data, content } = parseFrontmatter(raw);

          let categories = ['General'];
          if (fs.existsSync(categoryPath)) {
            const catRaw = fs.readFileSync(categoryPath, 'utf-8').trim();
            if (catRaw) {
              categories = catRaw.split(',').map(c => c.trim()).filter(Boolean);
            }
          }

          let authors = [];
          if (fs.existsSync(authorPath)) {
            const authorRaw = fs.readFileSync(authorPath, 'utf-8').trim();
            if (authorRaw) {
              authors = authorRaw.split(',').map(a => a.trim()).filter(Boolean);
            }
          }

          const githubUrl = `${GITHUB_REPO}/blob/${GITHUB_BRANCH}/skills/${folderName}/SKILL.md`;
          
          // Generate ZIP for the skill
          const zipFileName = `${folderName}.zip`;
          const zipPath = path.join(downloadsDir, zipFileName);
          
          try {
            // Keep createZip for single skill
            const createZipInternal = (sourceDir, outPath) => {
              return new Promise((resolve, reject) => {
                const output = fs.createWriteStream(outPath);
                const archive = archiver('zip', { zlib: { level: 9 } });
                output.on('close', resolve);
                archive.on('error', reject);
                archive.pipe(output);
                archive.directory(sourceDir, false);
                archive.finalize();
              });
            };
            await createZipInternal(currentSkillDir, zipPath);
          } catch (err) {
            console.error(`Failed to create ZIP for skill ${folderName}:`, err);
          }

          const downloadUrl = `${context.baseUrl}downloads/skills/${zipFileName}`;

          return {
            id: folderName,
            name: data.name || folderName,
            description: data.description || '',
            license: data.license || null,
            content,
            categories,
            authors,
            githubUrl,
            downloadUrl,
            path: currentSkillDir, // Keep internal path for bundle zipping
          };
        })
      );

      const validSkills = skills.filter(Boolean);

      // --- Bundle Logic ---
      let bundles = [];
      if (fs.existsSync(bundlesPath)) {
        try {
          const rawBundles = JSON.parse(fs.readFileSync(bundlesPath, 'utf-8'));
          bundles = await Promise.all(rawBundles.map(async (bundle) => {
            // Requirement check: name is mandatory
            if (!bundle.name || !bundle.name.trim()) return null;

            // Mapping: Inclusive logic (OR across all filters)
            const matchedSkills = validSkills.filter(skill => {
              const matchedCategory = bundle.categories && skill.categories.some(c => bundle.categories.includes(c));
              const matchedFolder = bundle.folders && bundle.folders.includes(skill.id);
              const matchedAuthor = bundle.authors && skill.authors.some(a => bundle.authors.includes(a));
              
              return matchedCategory || matchedFolder || matchedAuthor;
            });

            // Requirement check: hide empty bundles
            if (matchedSkills.length === 0) return null;

            const bundleId = bundle.id || bundle.name.toLowerCase().replace(/\s+/g, '-');
            const zipFileName = `${bundleId}.zip`;
            const zipPath = path.join(bundleDownloadsDir, zipFileName);

            // Generate ZIP for the bundle
            try {
              const sources = matchedSkills.map(s => ({ name: s.id, path: s.path }));
              await createBundleZip(sources, zipPath);
            } catch (err) {
              console.error(`Failed to create ZIP for bundle ${bundle.name}:`, err);
            }

            const downloadUrl = `${context.baseUrl}downloads/bundles/${zipFileName}`;

            return {
              id: bundleId,
              name: bundle.name,
              description: bundle.description || '',
              skillIds: matchedSkills.map(s => s.id),
              downloadUrl,
            };
          }));
        } catch (err) {
          console.error('Failed to parse bundles.json:', err);
        }
      }

      // Cleanup internal paths before returning to Docusaurus
      const cleanedSkills = validSkills.map(({ path: _, ...rest }) => rest);

      return { 
        skills: cleanedSkills, 
        bundles: bundles.filter(Boolean),
        infoDoc 
      };
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions;
      const { skills, bundles, infoDoc } = content;

      // Write data modules
      const skillsDataPath = await createData('skills-index.json', JSON.stringify(skills));
      const bundlesDataPath = await createData('bundles-index.json', JSON.stringify(bundles));
      const infoDataPath = await createData('info-doc.json', JSON.stringify({ content: infoDoc }));

      const { baseUrl } = context;

      // Home route
      addRoute({
        path: baseUrl,
        component: '@site/src/components/HomePage',
        modules: {
          skillsData: skillsDataPath,
          bundlesData: bundlesDataPath,
          infoData: infoDataPath,
        },
        exact: true,
      });

      // Individual skill routes
      for (const skill of skills) {
        const skillDataPath = await createData(
          `skill-${skill.id}.json`,
          JSON.stringify(skill)
        );

        addRoute({
          path: `${baseUrl}skill/${skill.id}`,
          component: '@site/src/components/SkillPage',
          modules: {
            skillData: skillDataPath,
          },
          exact: true,
        });
      }
    },
  };
};

