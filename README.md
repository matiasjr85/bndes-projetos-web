BNDES Projetos Web

Frontend da aplicação BNDES Projetos, desenvolvido em Angular 19 com foco em autenticação JWT, rotas protegidas e integração completa com uma API REST.

O sistema permite:

Autenticação de usuários (login e cadastro)

Listagem, criação, edição e visualização de projetos

Comunicação segura com backend via JWT

Interface moderna com Angular Material

🛠️ Tecnologias Principais

Angular 19

TypeScript

Angular Material

RxJS

JWT (JSON Web Token)

SCSS

Angular Standalone Components

Proxy de desenvolvimento (Angular Dev Server)

📦 Bibliotecas Utilizadas

Principais dependências do projeto:

@angular/core
@angular/router
@angular/forms
@angular/common
@angular/platform-browser
@angular/platform-browser/animations
@angular/material
rxjs


Caso precise instalar manualmente (normalmente já vêm no projeto):

npm install @angular/material

📁 Arquitetura do Projeto (resumo)
src/
 ├─ app/
 │   ├─ core/
 │   │   └─ auth/
 │   │       ├─ auth.service.ts
 │   │       ├─ auth.guard.ts
 │   │       └─ jwt.interceptor.ts
 │   ├─ layout/
 │   │   └─ main-layout/
 │   ├─ pages/
 │   │   ├─ login/
 │   │   ├─ register/
 │   │   └─ projects/
 │   ├─ app.routes.ts
 │   └─ app.component.ts
 ├─ styles.scss
 └─ main.ts

🔐 Autenticação

Autenticação baseada em JWT

Token armazenado no localStorage

Interceptor (jwt.interceptor.ts) injeta automaticamente o token nas requisições

AuthGuard protege rotas privadas

Rotas públicas:

/login

/register

Rotas privadas:

/projects

🌐 Integração com Backend

Durante o desenvolvimento, o projeto utiliza proxy para evitar problemas de CORS.

Arquivo de proxy

proxy.conf.json

Exemplo:

{
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/projects": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}


O backend deve estar rodando em:

http://localhost:8080

▶️ Rodando o Projeto Localmente
1️⃣ Instalar dependências
npm install

2️⃣ Subir o servidor de desenvolvimento
ng serve


Ou explicitamente:

ng serve --configuration development

3️⃣ Acessar no navegador
http://localhost:4200


⚠️ Importante:
O proxy só funciona com ng serve.
Não utilize ng build para testes locais de API.

📌 Observações Importantes

Projeto utiliza Standalone Components (Angular moderno)

Não há NgModule

Interceptors são registrados via provideHttpClient

Layout principal centralizado no MainLayoutComponent

Código organizado para fácil evolução e manutenção

📚 Recursos Úteis

Angular CLI
https://angular.dev/tools/cli

Angular Material
https://material.angular.io/

Angular Router
https://angular.dev/guide/routing