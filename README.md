# 🖥️ BNDES Projetos Web

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![Material](https://img.shields.io/badge/Angular%20Material-UI-673AB7)
![Status](https://img.shields.io/badge/Status-Em%20Evolução-blue)

Frontend desenvolvido em **Angular 19 + Angular Material**, responsável pelo consumo da **API BNDES Projetos**, com foco em **organização**, **experiência do usuário (UX)** e **integração segura via JWT**.

---

## 📌 Sumário
- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Requisitos](#-requisitos)
- [Execução do Projeto](#-execução-do-projeto)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Configurações de Ambiente](#-configurações-de-ambiente)
- [Padrões e Boas Práticas](#-padrões-e-boas-práticas)
- [Roadmap](#-roadmap)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O **BNDES Projetos Web** é a camada **frontend** da plataforma BNDES Projetos, oferecendo uma interface moderna, responsiva e segura para gerenciamento de projetos e usuários.

O sistema utiliza **Angular Standalone Components**, interceptors para segurança e uma estrutura organizada por domínios.

---

## 🚀 Funcionalidades

### 🔐 Autenticação
- Cadastro de usuários (**Register**)
- Autenticação via **Login**
- Armazenamento de token **JWT**
- Proteção de rotas com **AuthGuard**

### 📁 Gestão de Projetos
- Listagem de projetos com paginação, filtros e ordenação
- CRUD completo (Criar, Editar, Visualizar e Excluir)

### 🎨 Experiência do Usuário
- Angular Material
- Formatação de moeda (**BRL**)
- Datas (**pt-BR**)
- Feedback visual

### 🛡️ Segurança
- JWT via Interceptor
- Tratamento global de **401 / 403**
- Redirecionamento para login

---

## 🧰 Tecnologias

- Angular 19 (Standalone)
- TypeScript
- Angular Material
- RxJS
- Angular Router

---

## 🏗️ Arquitetura

```txt
┌──────────────┐
│   Browser    │
│  (Angular)   │
└──────┬───────┘
       │ HTTP + JWT
┌──────▼────────┐
│ Interceptors  │
│ Auth / Errors │
└──────┬────────┘
       │
┌──────▼────────┐
│   Services    │
│  (Core/API)   │
└──────┬────────┘
       │
┌──────▼────────┐
│   Backend     │
│ Spring Boot  │
└───────────────┘
```

---

## ✅ Requisitos

- Node.js 18+
- Angular CLI 19+
- API rodando em `http://127.0.0.1:8080`

---

## ▶️ Execução do Projeto

```bash
npm install
ng serve
```

Frontend: `http://localhost:4200`

Backend (Docker):

```bash
docker compose up --build
```

---

## 🔐 Autenticação e Segurança

- JWT armazenado no navegador
- Header automático:

```http
Authorization: Bearer <token>
```

- Interceptors:
  - `jwt.interceptor`
  - `auth-error.interceptor`

---

## 📁 Estrutura do Projeto

```txt
src/app
├── core
│   ├── auth
│   └── projects
├── layout
│   └── main-layout
└── pages
    ├── login
    ├── register
    └── projects
```

---

## 🧪 Scripts Disponíveis

```bash
ng serve
ng build
ng test
ng lint
```

---

## ⚙️ Configurações de Ambiente

- `environment.ts` para produção
- Proxy para desenvolvimento

---

## 📐 Padrões e Boas Práticas

- Standalone Components
- Guards
- Interceptors
- Services desacoplados
- Estrutura escalável

---

## 🛣️ Roadmap

- [ ] Refresh Token
- [ ] Roles (ADMIN / USER)
- [ ] Testes unitários completos
- [ ] CI/CD
- [ ] Build Docker

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`feat/minha-feature`)
3. Commit seguindo o padrão
4. Abra um Pull Request

### Padrão de Commit

```txt
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração
docs: documentação
```

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**.

---

📌 Projeto em evolução contínua.
