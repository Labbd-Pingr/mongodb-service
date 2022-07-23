![Logo of the project](https://github.com/Labbd-Pingr/pingr--/blob/master/docs/logo.png)

## Pingr--

O Pingr-- é uma rede social no formato de blog, caracterizada por postagens de texto de até 140 caracteres e/ou imagens e que, ainda, podem ser classificados através do uso de palavras-chave. Nele, os usuários podem curtir, responder e compartilhar as postagens, além de poderem visualizar os assuntos mais quentes no mundo através das palavras-chave mais usadas no dia. Para ter acesso ao sistema, os usuários devem criar uma conta e iniciar uma sessão. Através dessa conta, é possível seguir outros usuários e realizar troca de mensagens privadas (PV). O escopo foi baseado no projeto [Pingr](https://docs.google.com/document/d/1nTM8w-je-D6NJbVRdWyDXhODOeQjq_jgvquJXCGVTvE) apresentado no curso de verão do IME-USP em 2021, com as devidas permissões de uso.

Este repositório contém o código da API do Pingr-- em conjunto com uma documentação gerada pelo Swagger UI.

## Tecnologias

- Docker
  - Docker Compose
- Node.js
- Typescript
- Express
- Swagger UI
- Mongodb
- Redis Stack
  - Redis-om
- PostgreSQL
  - Type-orm
- Neo4j

## Getting started

Crie um arquivo `.env` a partir do arquivo `.env.sample`

> **Warning**
>
> Caso decida alterar a porta padrão, você irá precisar alterar os arquivos `Dockerfile` e `docker-compose.yml`.

Na primeira vez que for executar o projeto, rode na raiz:

```bash
$ docker-compose build
$ yarn install
```

Nas outras vezes ou logo em seguida, rode:

```bash
docker-compose up #-d, se você deseja rodar em background
```

A API estará rodando em `localhost:<Port>`.

## Requisitos

- O sistema deve permitir o cadastro de novos usuários, salvando as suas informações tanto de perfil quanto de autenticação.

  - Dados do perfil: nome, username (começado por @), biografia, data de nascimento e email.
  - Dados de autenticação: email e senha.
  - Ao se cadastrar, o sistema irá gerar um ID único para aquele usuário, para este poder recuperar os seus dados de perfil sempre que necessário.

- O sistema deve permitir o login e desconexão de usuários cadastrados.

  - Após a autenticação ser bem sucedida, o sistema deve armazenar os dados da sessão do usuário.
  - O usuário deve possuir uma sessão válida para usar o sistema.
  - Caso a sua sessão esteja expirada, é necessário realizar o login novamente.

- Um usuário pode seguir e deixar de seguir outros usuários.

  - Essa relação não é espelhada, isto é, quando um usuário A começa a seguir um usuário B, isto não significa que B começa a seguir A.

- Um usuário pode bloquear outros usuários.

  - Essa relação não é espelhada, isto é, quando um usuário A bloqueia um usuário B, isto não significa que B bloqueia A.
  - Se um usuário A bloqueia um usuário B, qualquer relação entre eles será desfeita, ou seja, se A seguia B e/ou B seguia A, essas relações serão excluídas do sistema.

- Um usuário pode desbloquear qualquer outro usuário bloqueado por ele.

  - Esta ação não irá restaurar as relações excluídas no momento em que houve o bloqueio.

- O usuário pode criar uma postagem de até 140 caracteres.

  - Uma postagem não pode ser editada, mas pode ser apagada pelo autor.
  - A postagem é composta por um cabeçalho e um corpo.
  - O cabeçalho define informações como:
    - ID do perfil do autor da postagem
    - ID da postagem
    - Data/Horário
  - O corpo define informações como:
    - texto
    - hashtags

- Uma postagem pode ser curtida, compartilhada e/ou respondida com uma nova postagem.
  - Os compartilhamentos e as respostas também são postagens. Portanto, seguem as restrições de criação de uma nova postagem.
  - Além disso, é criada uma relação entre as postagens:
    - Respostas: Relação entre a resposta e a postagem original;
    - Compartilhamento: Relação entre a nova postagem e a original.
    - Para as curtidas, é criada uma relação entre a postagem e o usuário que a curtiu.

## Modelagens

## Autores

- **Daniel Leal**:
  <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="githubLogo" width="28px" height="28px"> [@lealdaniel](https://github.com/lealdaniel)

- **Thiago Guerrero**:
  <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="githubLogo" width="28px" height="28px"> [@T-Guerrero](https://github.com/T-Guerrero)

- **Vinicius Pereira Ximenes Frota**:
  <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="githubLogo" width="28px" height="28px"> [@viniciuspxf](https://github.com/viniciuspxf)
