const { retornarUsuarios, adicionarNovoUsuario } = require('../src/gerenciarUsuarios');
const {expect} = require('chai');

describe('Testar as funções de Gestão de Usuarios', function () {
    it ('Validar que posso adicionar um novo nome de usuario na lista', function () {
         // 1. Adicionar um novo nome na lista de usuarios 
        adicionarNovoUsuario({
        nome: 'Mariana',
        email: 'mariana@mais.com'
    });

         // 2. Retornar a lista de usuarios na caixa lista de usuarios
        const listaDeUsuarios = retornarUsuarios();

         // 3. Comparar se o novo nome está no fim da lista de usuarios
        expect(listaDeUsuarios.at(-1).nome).to.equal('Mariana');
        expect(listaDeUsuarios.at(-1).email).to.equal('mariana@mais.com');
    });
});