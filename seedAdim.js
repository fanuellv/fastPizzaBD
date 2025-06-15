const bcrypt = require("bcryptjs");
const db = require("./models");

(async () => {
  try {
    console.log(Object.keys(db)); // <-- Veja o que está sendo importado

    const { Usuario } = db;
    if (!Usuario) {
      throw new Error("❌ Modelo Usuario não encontrado.");
    }

    const senha = await bcrypt.hash("admin123", 10);

    await Usuario.findOrCreate({
      where: { email: "admin@fastpizza.com" },
      defaults: {
        nome: "Administrador",
        sobrenome: "Geral",
        telefone: "000000000",
        senha,
        tipo: "admin",
      },
    });

    console.log("✅ Admin criado com sucesso.");
  } catch (err) {
    console.error("Erro ao criar admin:", err);
  } finally {
    process.exit();
  }
})();
