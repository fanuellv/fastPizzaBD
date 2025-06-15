const { Usuario, Endereco } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Login

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ mensagem: "Email ou senha inválidos" });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: "Email ou senha inválidos" });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo }, // opcional colocar no token
      process.env.JWT_SECRET || "segredo_simples",
      { expiresIn: "1h" }
    );

    /*  ➡️  AGORA devolvemos `tipo`  */
    res.json({
      mensagem: "Login bem-sucedido",
      token,
      usuario: {
        id:         usuario.id,
        nome:       usuario.nome,
        sobrenome:  usuario.sobrenome,
        email:      usuario.email,
        tipo:       usuario.tipo      // <<<<<<
      },
    });
  } catch (err) {
    console.error("Erro ao tentar login:", err);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};


// Registro
exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ mensagem: "Email já registrado" });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
    });

    res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

exports.criarUsuarioComEndereco = async (req, res) => {
  try {
    const {
      nome,
      sobrenome,
      telefone,
      email,
      senha,
      casa, // rua
      municipio,
      tipo,
    } = req.body;

    // Verificar se email já existe
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ mensagem: "Email já registrado" });
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      senha: senhaCriptografada,
      tipo: tipo || "cliente",
    });

    // Criar endereço associado
    const endereco = await Endereco.create({
      rua: casa,
      bairro: "Centro",
      municipio,
      provincia: "Luanda",
      id_usuario: usuario.id,
    });

    res.status(201).json({ usuario, endereco });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar usuário com endereço" });
  }
};
// exports.criarUsuarioComEndereco = async (req, res) => {
//   try {
//     const { nome, email, senha, tipo, rua, bairro, municipio, provincia } =
//       req.body;

//     // Primeiro, cria o usuário
//     const usuario = await Usuario.create({
//       nome,
//       email,
//       senha,
//       tipo: tipo || "cliente",
//     });

//     // Depois, cria o endereço ligado ao usuário
//     const endereco = await Endereco.create({
//       rua,
//       bairro,
//       municipio,
//       provincia,
//       id_usuario: usuario.id, // vincula ao usuário criado
//     });

//     res.status(201).json({
//       usuario,
//       endereco,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ erro: "Erro ao criar usuário com endereço" });
//   }
// };

exports.getAllUsers = async (req, res) => {
  const users = await Usuario.findAll();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await Usuario.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await Usuario.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  await user.update(req.body);
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const user = await Usuario.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  await user.destroy();
  res.json({ message: "Usuário removido com sucesso" });
};
