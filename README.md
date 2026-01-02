🖥️ BNDES Projetos Web

Frontend desenvolvido em Angular + Angular Material para consumo da API BNDES Projetos, com foco em organização, UX e integração segura via JWT.

🚀 O que este sistema faz

Permite cadastro e autenticação de usuários (Login / Register)

Lista projetos com paginação, filtro e ordenação

Permite CRUD de projetos (criar, editar, visualizar e excluir)

Aplica formatação de moeda (BRL) e datas (pt-BR)

Protege rotas com AuthGuard

Anexa JWT automaticamente nas requisições (Interceptor)

Trata 401/403 globalmente com redirecionamento e mensagem (Interceptor)

🧰 Tecnologias

Angular 19 (Standalone Components)

TypeScript

Angular Material

RxJS

Angular Router

📡 Integração com a API (Proxy)

Este frontend usa proxy no ambiente de desenvolvimento para evitar problemas de CORS.

Arquivo: proxy.conf.json

Rotas encaminhadas para a API:
- /auth    -> http://127.0.0.1:8080
- /projects -> http://127.0.0.1:8080
- /health  -> http://127.0.0.1:8080

Obs.: O proxy já está configurado no angular.json (serve.options.proxyConfig).

✅ Requisitos

Node.js 18+ (recomendado)

Angular CLI 19+

API rodando em http://127.0.0.1:8080

▶️ Rodar aplicação (dev)

1) Instalar dependências
npm install

2) Subir o frontend
ng serve

Frontend: http://localhost:4200

▶️ Rodar a API (backend)

No projeto bndes-projetos-api (recomendado via Docker Compose):
docker compose up --build

API: http://localhost:8080


🔐 Autenticação e segurança (resumo)

Token JWT é armazenado no navegador e enviado automaticamente no header Authorization pelo jwt.interceptor.

Erros 401/403 são tratados globalmente pelo auth-error.interceptor, exibindo mensagem e redirecionando para /login quando necessário.

📁 Estrutura (resumo)

src/app/core/auth
- auth.service.ts
- auth.guard.ts
- jwt.interceptor.ts
- auth-error.interceptor.ts

src/app/core/projects
- project.service.ts

src/app/layout
- main-layout (toolbar, logout, router-outlet)

src/app/pages
- login
- register
- projects (list/detail/form)

✅ Considerações finais

Este projeto busca entregar um frontend funcional e organizado, com:

Integração limpa com a API

Boa experiência de uso (filtros, paginação, feedback)

Padrões de segurança básicos (JWT + proteção de rotas)

Facilidade de manutenção e evolução
