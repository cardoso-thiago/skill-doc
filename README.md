# 🌌 Skills Showcase

Um catálogo moderno, editorial e dinâmico para exibição de habilidades técnicas (Skills) utilizando **Docusaurus v3** como engine, com um layout totalmente customizado e focado em legibilidade e impacto visual.

---

## 🚀 Funcionalidades

- **Busca Instantânea**: Filtro rápido por nome, ID ou descrição da skill.
- **Layout Editorial**: Fundo escuro profundo, tipografia refinada e acentos em verde elétrico.
- **Renderização de Markdown**: Suporte completo a GFM (GitHub Flavored Markdown) e syntax highlighting (Highlight.js).
- **Deploy Automático**: Integração nativa com GitHub Actions para publicação instantânea.
- **Customização Total**: Engine Docusaurus sem o visual padrão "documentação".

---

## 📂 Como Adicionar uma Skill

Para adicionar uma nova skill ao catálogo, basta criar uma pasta dentro do diretório `/skills` e incluir um arquivo `SKILL.md`:

1. Crie a pasta: `/skills/nome-da-minha-skill/`
2. Crie o arquivo: `SKILL.md`
3. Adicione o Frontmatter (metadados) no topo:

```markdown
---
name: Nome da Skill
description: Uma breve descrição técnica do que ela faz.
license: MIT
---

# Título da Skill

Seu conteúdo Markdown aqui...
```

O sistema irá detectar automaticamente a nova pasta, ler os metadados e gerar as rotas tanto para a Home quanto para a página interna.

---

## 💻 Desenvolvimento Local

Se quiser rodar o projeto na sua máquina para testar mudanças de layout:

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start
   ```

3. Abra `http://localhost:3000/skill-doc/` no seu navegador.

---

## 🏗️ Estrutura do Projeto

- `/skills`: O coração do conteúdo (Markdown).
- `/plugins/skills-plugin.js`: Lógica customizada de processamento e roteamento.
- `/src/components`: Componentes React (Home e SkillPage).
- `/src/css/custom.css`: Sistema de design (Design Tokens e Reset).

---

Feito com ⚡ e **Docusaurus**.
