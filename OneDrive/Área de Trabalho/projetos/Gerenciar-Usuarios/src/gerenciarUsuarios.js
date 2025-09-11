
const usuarios = [
    {
        nome: 'Jessica',
        email:'jessica@mais.com'
    },
    {
        nome: 'Anna',
        email: 'anna@mais.com'
    },
    {
        nome: 'Rafaela',
        email: 'rafaela@mais.com'
    },
    {
        nome: 'Ivanir',
        email: 'ivanir@mais.com'
    }
];

function retornarUsuarios() {
    return usuarios;
}

    function adicionarNovoUsuario(usuario) {
    usuarios.push(usuario);
}

module.exports = { 
    retornarUsuarios,
    adicionarNovoUsuario
}