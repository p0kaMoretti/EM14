/// <reference types="cypress" />
import contrato from '../contracts/usuarios.contract'

describe('Testes da Funcionalidade Usuários', () => {
    let token
    before(() => {
        cy.token('taniar@qa.com.br', 'teste1').then(tkn => { token = tkn })
    });

    it('Deve validar contrato de usuários', () => {
        cy.request('usuarios').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Deve listar usuários cadastrados', () => {
        cy.request({
            method: 'GET',
            url: 'usuarios'
        }).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('usuarios')
            expect(response.duration).to.be.lessThan(15)
        })

    });

    it('Deve cadastrar um usuário com sucesso', () => {
        cy.usuarioRandom()
        .then((response) => {
            expect(response.status).to.equal(201),
                expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    });

    it('Deve validar um usuário com email inválido', () => {
        cy.cadastrarUsuario('Koala', 'marilou@qa.com.br', 'teste', 'true')
            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Este email já está sendo usado')
            })
    });

    it('Deve editar um usuário previamente cadastrado', () => {
        const providers = ["@apple.com", "@gmail.com", "@pokemon.com"];
        const email = Math.floor(Math.random() * 100000).toString(16);
        const fullEmail = `${email}${providers[Math.floor(Math.random() * (providers.length - 1))]}`;
            cy.usuarioRandom().then(response => {
            let id = response.body._id
            cy.request({
                method: 'PUT',
                url: `usuarios/${id}`,
                headers: { authorization: token },
                body:
                {
                    "nome": "Fulano da Silva",
                    "email": fullEmail,
                    "password": "teste",
                    "administrador": "true",
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve deletar um usuário previamente cadastrado', () => {
        cy.usuarioRandom().then(response => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `usuarios/${id}`,
                }).then(response =>{
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })
        })
    });


});
